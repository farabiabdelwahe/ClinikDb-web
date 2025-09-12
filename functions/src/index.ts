import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

admin.initializeApp();
const db = admin.firestore();

type PlanType = 'basic' | 'pro' | 'enterprise' | string;

const PLAN_PRICES: Record<PlanType, number> = {
  basic: 49,
  pro: 99,
  enterprise: 199
};

const COMMISSION_RATE = 0.2; // 20%

// Helpers
function commissionAmount(plan: PlanType): number {
  const price = PLAN_PRICES[plan] ?? 0;
  return Math.round(price * COMMISSION_RATE * 100) / 100;
}

// Trigger: on subscription created
export const onSubscriptionCreated = functions.firestore
  .document('subscriptions/{id}')
  .onCreate(async (snap) => {
    const sub = snap.data() as any;
    const now = Date.now();

    if (sub.promocode_id) {
      const promoRef = db.collection('promocodes').doc(sub.promocode_id);
      const promoSnap = await promoRef.get();
      if (promoSnap.exists) {
        const promo = promoSnap.data() as any;
        // increment redemption_count and link first subscription if not set
        const updates: any = { redemption_count: admin.firestore.FieldValue.increment(1), updatedAt: now };
        if (!promo.linked_subscription_id) updates.linked_subscription_id = snap.id;
        await promoRef.set(updates, { merge: true });

        // if agent assigned, create unpaid commission
        if (promo.assigned_agent_id) {
          const commission = {
            agent_id: promo.assigned_agent_id,
            promocode_id: promoRef.id,
            subscription_id: snap.id,
            commission_status: 'unpaid',
            amount: commissionAmount(sub.plan_type),
            currency: 'USD',
            createdAt: sub.start_date ?? now,
            updatedAt: now
          };
          await db.collection('agent_promocode_commissions').add(commission);
        }
      }
    }
  });

// Scheduled monthly aggregator (runs on 1st of month 00:05 UTC)
export const monthlyCommissionSnapshot = functions.pubsub
  .schedule('5 0 1 * *')
  .timeZone('UTC')
  .onRun(async () => {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth(); // current month
    // We want previous month
    const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0)).getTime();
    const end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999)).getTime();

    const q = db.collection('agent_promocode_commissions')
      .where('createdAt', '>=', start)
      .where('createdAt', '<=', end);
    const snap = await q.get();

    const byAgent: Record<string, { unpaid: number; paid: number; ids: string[] }> = {};
    snap.forEach((doc) => {
      const c = doc.data() as any;
      const key = c.agent_id;
      if (!byAgent[key]) byAgent[key] = { unpaid: 0, paid: 0, ids: [] };
      if (c.commission_status === 'paid') byAgent[key].paid += c.amount; else byAgent[key].unpaid += c.amount;
      byAgent[key].ids.push(doc.id);
    });

    const monthKey = new Date(start).toISOString().slice(0, 7); // YYYY-MM
    await db.collection('monthly_payouts').doc(monthKey).set({
      range: { start, end },
      byAgent,
      createdAt: Date.now()
    }, { merge: true });

    return null;
  });

// Placeholder webhook for Flouci (replace with real verification)
export const flouciWebhook = functions.https.onRequest(async (req, res) => {
  try {
    const { subscriptionId, transactionId, status } = req.body || {};
    if (subscriptionId) {
      await db.collection('subscriptions').doc(subscriptionId).set({
        transaction_record: transactionId || 'mock',
        status: status || 'active',
        updatedAt: Date.now()
      }, { merge: true });
    }
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false });
  }
});


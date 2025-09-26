import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  query,
  where,
  limit,
  getDocs,
  increment,
} from '@angular/fire/firestore';
import { BehaviorSubject, Observable, from, map, of } from 'rxjs';
import { Agent } from '../models/agent.model';
import { PromoCode } from '../models/promocode.model';
import { AgentPromoCodeCommission, CommissionStatus } from '../models/commission.model';
import { Subscription } from '../models/subscription.model';
import { AppUser } from '../models/app-user.model';
import { environment } from '../../environments/environment';
import dashboardDemo from '../../assets/mock/admin-dashboard-demo.json';

// Simple seeded prices. Adjust as needed.
const PLAN_PRICES: Record<Subscription['plan_type'], number> = {
  basic: 49,
  pro: 99,
  enterprise: 199
};

const COMMISSION_RATE = 0.2; // 20% of plan price for first month

@Injectable({ providedIn: 'root' })
export class AdminDataService {
  private firestore: Firestore | null = environment.features?.useDashboardMockData ? null : inject(Firestore, { optional: true });
  private readonly useMock = !this.firestore || environment.features?.useDashboardMockData === true;

  private readonly demoMonthTotals = environment.features?.useDashboardMockData ? (dashboardDemo?.overview?.metrics?.month ?? null) : null;

  private agents$ = new BehaviorSubject<Agent[]>([]);
  private promoCodes$ = new BehaviorSubject<PromoCode[]>([]);
  private subscriptions$ = new BehaviorSubject<Subscription[]>([]);
  private commissions$ = new BehaviorSubject<AgentPromoCodeCommission[]>([]);
  private doctors$ = new BehaviorSubject<AppUser[]>([]);

  constructor() {
    if (this.useMock) {
      this.seed();
    }
  }

  private toMillis(value: any): number {
    if (!value) {
      return Date.now();
    }
    if (typeof value === 'number') {
      return value;
    }
    if (value.toMillis) {
      return value.toMillis();
    }
    if (typeof value === 'object' && 'seconds' in value) {
      return Number(value.seconds) * 1000 + Math.floor(Number(value.nanoseconds ?? 0) / 1_000_000);
    }
    return Date.now();
  }

  private async ensureUserRecord(
    email: string,
    role: 'agent' | 'doctor',
    displayName?: string,
    extras: Record<string, unknown> = {}
  ): Promise<string | null> {
    if (!this.firestore) {
      return null;
    }

    const normalizedEmail = email.toLowerCase();
    const usersRef = collection(this.firestore, 'users');
    const existing = await getDocs(
      query(usersRef, where('email', '==', normalizedEmail), limit(1))
    );

    if (existing.empty) {
      const created = await addDoc(usersRef, {
        email: normalizedEmail,
        role,
        displayName: displayName ?? normalizedEmail,
        createdAt: serverTimestamp(),
        ...extras,
      });
      return created.id;
    } else {
      const docRef = existing.docs[0].ref;
      await updateDoc(docRef, {
        role,
        displayName: displayName ?? existing.docs[0].data()['displayName'],
        ...extras,
      });
      return docRef.id;
    }
  }

  // Seed with mock data sourced from JSON for demo/dev
  private seed(): void {
    const now = Date.now();
    const dayMs = 86_400_000;
    const fromDaysAgo = (daysAgo?: number): number => {
      if (typeof daysAgo === 'number') {
        return now - daysAgo * dayMs;
      }
      return now;
    };

    if (environment.features?.useDashboardMockData) {
      const data = dashboardDemo as any;

      const agents: Agent[] = (data?.agents ?? []).map((agent: any) => ({
        id: agent.id,
        displayName: agent.displayName,
        email: agent.email ?? undefined,
        userId: agent.userId ?? undefined,
        createdAt: fromDaysAgo(agent.createdAtDaysAgo),
      }));
      this.agents$.next(agents);

      const promoCodes: PromoCode[] = (data?.promoCodes ?? []).map((promo: any) => ({
        id: promo.id,
        code: promo.code,
        assigned_agent_id: promo.assigned_agent_id ?? undefined,
        linked_subscription_id: promo.linked_subscription_id ?? undefined,
        discount_type: promo.discount_type,
        discount_value: Number(promo.discount_value ?? 0),
        valid_from: promo.valid_from_days_ago !== undefined ? fromDaysAgo(promo.valid_from_days_ago) : undefined,
        valid_to: promo.valid_to_days_ago !== undefined ? fromDaysAgo(promo.valid_to_days_ago) : undefined,
        redemption_count: Number(promo.redemption_count ?? 0),
        status: promo.status ?? 'inactive',
        createdAt: fromDaysAgo(promo.createdAtDaysAgo),
        updatedAt: promo.updatedAtDaysAgo !== undefined ? fromDaysAgo(promo.updatedAtDaysAgo) : undefined,
        created_by_admin_id: promo.created_by_admin_id ?? undefined,
      }));
      this.promoCodes$.next(promoCodes);

      const subscriptions: Subscription[] = (data?.subscriptions ?? []).map((sub: any) => ({
        id: sub.id,
        promocode_id: sub.promocode_id ?? undefined,
        primary_email: sub.primary_email,
        status: sub.status ?? 'active',
        start_date: fromDaysAgo(sub.start_date_days_ago ?? sub.createdAtDaysAgo),
        end_date: sub.end_date_days_ago !== undefined ? fromDaysAgo(sub.end_date_days_ago) : undefined,
        payment_method: sub.payment_method ?? 'flouci',
        transaction_record: sub.transaction_record ?? undefined,
        plan_type: sub.plan_type ?? 'basic',
        createdAt: fromDaysAgo(sub.createdAtDaysAgo ?? sub.start_date_days_ago),
        updatedAt: sub.updatedAtDaysAgo !== undefined ? fromDaysAgo(sub.updatedAtDaysAgo) : undefined,
      }));
      this.subscriptions$.next(subscriptions);

      const commissions: AgentPromoCodeCommission[] = (data?.commissions ?? []).map((commission: any) => ({
        id: commission.id,
        agent_id: commission.agent_id,
        promocode_id: commission.promocode_id,
        subscription_id: commission.subscription_id ?? undefined,
        commission_status: commission.commission_status ?? 'unpaid',
        amount: Number(commission.amount ?? 0),
        currency: commission.currency ?? 'USD',
        createdAt: fromDaysAgo(commission.createdAtDaysAgo),
        updatedAt: fromDaysAgo(commission.updatedAtDaysAgo ?? commission.createdAtDaysAgo),
      }));
      this.commissions$.next(commissions);

      const doctors: AppUser[] = (data?.doctors ?? []).map((doctor: any) => ({
        id: doctor.id,
        email: doctor.email,
        role: 'doctor',
        displayName: doctor.displayName,
        createdAt: fromDaysAgo(doctor.createdAtDaysAgo),
        photoURL: doctor.photoURL ?? null,
      }));
      this.doctors$.next(doctors);

      return;
    }

    const nowFallback = Date.now();
    const agentA: Agent = {
      id: 'ag_1',
      displayName: 'Alice Sales',
      email: 'alice@agency.com',
      createdAt: nowFallback - 1000 * 60 * 60 * 24 * 40
    };
    const agentB: Agent = {
      id: 'ag_2',
      displayName: 'Bob Sales',
      email: 'bob@agency.com',
      createdAt: nowFallback - 1000 * 60 * 60 * 24 * 10
    };
    const promo1: PromoCode = {
      id: 'pc_1',
      code: 'ALICE20',
      assigned_agent_id: agentA.id,
      discount_type: 'percentage',
      discount_value: 20,
      redemption_count: 2,
      status: 'active',
      createdAt: nowFallback - 1000 * 60 * 60 * 24 * 30
    };
    const promo2: PromoCode = {
      id: 'pc_2',
      code: 'BOB10',
      assigned_agent_id: agentB.id,
      discount_type: 'fixed',
      discount_value: 10,
      redemption_count: 1,
      status: 'active',
      createdAt: nowFallback - 1000 * 60 * 60 * 24 * 15
    };
    const s1: Subscription = {
      id: 'sub_1',
      promocode_id: promo1.id,
      primary_email: 'clinic.one@example.com',
      status: 'active',
      start_date: nowFallback - 1000 * 60 * 60 * 24 * 14,
      plan_type: 'pro',
      payment_method: 'flouci',
      createdAt: nowFallback - 1000 * 60 * 60 * 24 * 14
    };
    const s2: Subscription = {
      id: 'sub_2',
      promocode_id: promo2.id,
      primary_email: 'clinic.two@example.com',
      status: 'active',
      start_date: nowFallback - 1000 * 60 * 60 * 24 * 3,
      plan_type: 'basic',
      payment_method: 'flouci',
      createdAt: nowFallback - 1000 * 60 * 60 * 24 * 3
    };
    const c1: AgentPromoCodeCommission = {
      id: 'cm_1',
      agent_id: agentA.id,
      promocode_id: promo1.id,
      subscription_id: s1.id,
      commission_status: 'unpaid',
      amount: PLAN_PRICES[s1.plan_type] * COMMISSION_RATE,
      currency: 'USD',
      createdAt: s1.start_date,
      updatedAt: nowFallback
    };
    const c2: AgentPromoCodeCommission = {
      id: 'cm_2',
      agent_id: agentB.id,
      promocode_id: promo2.id,
      subscription_id: s2.id,
      commission_status: 'paid',
      amount: PLAN_PRICES[s2.plan_type] * COMMISSION_RATE,
      currency: 'USD',
      createdAt: s2.start_date,
      updatedAt: nowFallback
    };
    this.agents$.next([agentA, agentB]);
    this.promoCodes$.next([promo1, promo2]);
    this.subscriptions$.next([s1, s2]);
    this.commissions$.next([c1, c2]);
    const doctor: AppUser = {
      id: 'doc_1',
      email: 'dr.jane@example.com',
      role: 'doctor',
      displayName: 'Dr. Jane Smith',
      createdAt: nowFallback - 1000 * 60 * 60 * 24 * 20,
      photoURL: null,
    };
    this.doctors$.next([doctor]);
  }

  // Streams
  getAgents(): Observable<Agent[]> {
    if (!this.firestore) {
      return this.agents$.asObservable();
    }

    const agentsRef = collection(this.firestore, 'agents');
    return collectionData(agentsRef, { idField: 'id' }).pipe(
      map((docs) =>
        docs.map((doc: any) => ({
          id: doc.id as string,
          displayName: doc.displayName ?? '',
          email: doc.email ?? undefined,
          userId: doc.userId ?? undefined,
          createdAt: this.toMillis(doc.createdAt),
        }))
      )
    );
  }

  getPromoCodes(): Observable<PromoCode[]> {
    if (!this.firestore) {
      return this.promoCodes$.asObservable();
    }

    const promoRef = collection(this.firestore, 'promocodes');
    return collectionData(promoRef, { idField: 'id' }).pipe(
      map((docs) =>
        docs.map((doc: any) => ({
          id: doc.id as string,
          code: doc.code,
          assigned_agent_id: doc.assigned_agent_id ?? undefined,
          linked_subscription_id: doc.linked_subscription_id ?? undefined,
          discount_type: doc.discount_type,
          discount_value: Number(doc.discount_value ?? 0),
          valid_from: doc.valid_from ? this.toMillis(doc.valid_from) : undefined,
          valid_to: doc.valid_to ? this.toMillis(doc.valid_to) : undefined,
          redemption_count: Number(doc.redemption_count ?? 0),
          status: doc.status ?? 'inactive',
          createdAt: this.toMillis(doc.createdAt),
          updatedAt: doc.updatedAt ? this.toMillis(doc.updatedAt) : undefined,
          created_by_admin_id: doc.created_by_admin_id ?? undefined,
        }))
      )
    );
  }

  getSubscriptions(): Observable<Subscription[]> {
    if (!this.firestore) {
      return this.subscriptions$.asObservable();
    }

    const subRef = collection(this.firestore, 'subscriptions');
    return collectionData(subRef, { idField: 'id' }).pipe(
      map((docs) =>
        docs.map((doc: any) => ({
          id: doc.id as string,
          promocode_id: doc.promocode_id ?? undefined,
          primary_email: doc.primary_email,
          status: doc.status ?? 'active',
          start_date: this.toMillis(doc.start_date),
          end_date: doc.end_date ? this.toMillis(doc.end_date) : undefined,
          payment_method: doc.payment_method ?? undefined,
          transaction_record: doc.transaction_record ?? undefined,
          plan_type: doc.plan_type ?? 'basic',
          createdAt: this.toMillis(doc.createdAt),
          updatedAt: doc.updatedAt ? this.toMillis(doc.updatedAt) : undefined,
        }))
      )
    );
  }

  getCommissions(): Observable<AgentPromoCodeCommission[]> {
    if (!this.firestore) {
      return this.commissions$.asObservable();
    }

    const commissionsRef = collection(this.firestore, 'agent_promocode_commissions');
    return collectionData(commissionsRef, { idField: 'id' }).pipe(
      map((docs) =>
        docs.map((doc: any) => ({
          id: doc.id as string,
          agent_id: doc.agent_id,
          promocode_id: doc.promocode_id,
          subscription_id: doc.subscription_id ?? undefined,
          commission_status: doc.commission_status ?? 'unpaid',
          amount: Number(doc.amount ?? 0),
          currency: doc.currency ?? 'USD',
          createdAt: this.toMillis(doc.createdAt),
          updatedAt: this.toMillis(doc.updatedAt),
        }))
      )
    );
  }

  getDoctors(): Observable<AppUser[]> {
    if (!this.firestore) {
      return this.doctors$.asObservable();
    }

    const usersRef = collection(this.firestore, 'users');
    const doctorsQuery = query(usersRef, where('role', '==', 'doctor'));
    return collectionData(doctorsQuery, { idField: 'id' }).pipe(
      map((docs) =>
        docs.map((doc: any) => ({
          id: doc.id as string,
          email: doc.email ?? '',
          role: 'doctor',
          displayName: doc.displayName ?? doc.email ?? '',
          createdAt: this.toMillis(doc.createdAt),
          photoURL: doc.photoURL ?? null,
        }))
      )
    );
  }

  // CRUD-like operations (mock)
  createAgent(
    input: Omit<Agent, 'id' | 'createdAt'> & Partial<Pick<Agent, 'createdAt'>>
  ): Observable<Agent> {
    if (!this.firestore) {
      const agent: Agent = {
        id: 'ag_' + crypto.randomUUID(),
        createdAt: input.createdAt ?? Date.now(),
        displayName: input.displayName,
        email: input.email,
        userId: input.userId,
      };
      this.agents$.next([...this.agents$.value, agent]);
      return of(agent);
    }

    return from(this.createAgentInFirestore(input));
  }

  inviteAgent(
    input: Omit<Agent, 'id' | 'createdAt'> & Partial<Pick<Agent, 'createdAt'>>
  ): Observable<Agent> {
    return this.createAgent(input);
  }

  private async createAgentInFirestore(
    input: Omit<Agent, 'id' | 'createdAt'> & Partial<Pick<Agent, 'createdAt'>>
  ): Promise<Agent> {
    const agentsRef = collection(this.firestore!, 'agents');
    const normalizedEmail = input.email?.toLowerCase();
    const docRef = await addDoc(agentsRef, {
      displayName: input.displayName,
      email: normalizedEmail ?? null,
      userId: input.userId ?? null,
      createdAt: serverTimestamp(),
    });

    if (normalizedEmail) {
      await this.ensureUserRecord(normalizedEmail, 'agent', input.displayName, {
        linkedAgentId: docRef.id,
      });
    }

    return {
      id: docRef.id,
      displayName: input.displayName,
      email: normalizedEmail ?? undefined,
      userId: input.userId,
      createdAt: Date.now(),
    };
  }

  inviteDoctor(input: { email: string; displayName: string }): Observable<AppUser> {
    if (!this.firestore) {
      const doctor: AppUser = {
        id: 'doc_' + crypto.randomUUID(),
        email: input.email,
        displayName: input.displayName,
        role: 'doctor',
        createdAt: Date.now(),
        photoURL: null,
      };
      this.doctors$.next([doctor, ...this.doctors$.value]);
      return of(doctor);
    }

    return from(this.createDoctorInFirestore(input));
  }

  private async createDoctorInFirestore(input: {
    email: string;
    displayName: string;
  }): Promise<AppUser> {
    const id = await this.ensureUserRecord(input.email, 'doctor', input.displayName);
    return {
      id: id ?? 'doctor_' + crypto.randomUUID(),
      email: input.email.toLowerCase(),
      displayName: input.displayName,
      role: 'doctor',
      createdAt: Date.now(),
      photoURL: null,
    };
  }

  createPromoCode(
    input: Omit<PromoCode, 'id' | 'createdAt' | 'updatedAt' | 'redemption_count' | 'status'> &
      { status?: PromoCode['status'] }
  ): Observable<PromoCode> {
    if (!this.firestore) {
      const promo: PromoCode = {
        id: 'pc_' + crypto.randomUUID(),
        code: input.code,
        assigned_agent_id: input.assigned_agent_id,
        linked_subscription_id: input.linked_subscription_id,
        discount_type: input.discount_type,
        discount_value: input.discount_value,
        valid_from: input.valid_from,
        valid_to: input.valid_to,
        redemption_count: 0,
        status: input.status ?? 'active',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        created_by_admin_id: input.created_by_admin_id,
      };
      this.promoCodes$.next([promo, ...this.promoCodes$.value]);
      return of(promo);
    }

    const payload = {
      code: input.code,
      assigned_agent_id: input.assigned_agent_id ?? null,
      linked_subscription_id: input.linked_subscription_id ?? null,
      discount_type: input.discount_type,
      discount_value: input.discount_value,
      valid_from: input.valid_from ?? null,
      valid_to: input.valid_to ?? null,
      redemption_count: 0,
      status: input.status ?? 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      created_by_admin_id: input.created_by_admin_id ?? null,
    };

    return from(addDoc(collection(this.firestore!, 'promocodes'), payload)).pipe(
      map((ref) => ({
        id: ref.id,
        code: input.code,
        assigned_agent_id: input.assigned_agent_id,
        linked_subscription_id: input.linked_subscription_id,
        discount_type: input.discount_type,
        discount_value: input.discount_value,
        valid_from: input.valid_from,
        valid_to: input.valid_to,
        redemption_count: 0,
        status: input.status ?? 'active',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        created_by_admin_id: input.created_by_admin_id,
      }))
    );
  }

  onboardSubscription(input: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'start_date'> & { start_date?: number; status?: Subscription['status'] }): Observable<Subscription> {
    if (!this.firestore) {
      const sub: Subscription = {
        id: 'sub_' + crypto.randomUUID(),
        promocode_id: input.promocode_id,
        primary_email: input.primary_email,
        status: input.status ?? 'active',
        start_date: input.start_date ?? Date.now(),
        end_date: input.end_date,
        payment_method: input.payment_method ?? 'flouci',
        transaction_record: input.transaction_record,
        plan_type: input.plan_type,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      this.subscriptions$.next([sub, ...this.subscriptions$.value]);

      if (sub.promocode_id) {
        const promos = this.promoCodes$.value;
        const promo = promos.find((x) => x.id === sub.promocode_id);
        if (promo) {
          promo.redemption_count += 1;
          promo.updatedAt = Date.now();
          this.promoCodes$.next([...promos]);

          if (promo.assigned_agent_id) {
            const commission: AgentPromoCodeCommission = {
              id: 'cm_' + crypto.randomUUID(),
              agent_id: promo.assigned_agent_id,
              promocode_id: promo.id,
              subscription_id: sub.id,
              commission_status: 'unpaid',
              amount: PLAN_PRICES[sub.plan_type] * COMMISSION_RATE,
              currency: 'USD',
              createdAt: sub.start_date,
              updatedAt: Date.now(),
            };
            this.commissions$.next([commission, ...this.commissions$.value]);
          }
        }
      }

      return of(sub);
    }

    return from(this.onboardSubscriptionInFirestore(input));
  }

  private async onboardSubscriptionInFirestore(
    input: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'start_date'> &
      { start_date?: number; status?: Subscription['status'] }
  ): Promise<Subscription> {
    const subsRef = collection(this.firestore!, 'subscriptions');
    const normalizedEmail = input.primary_email.toLowerCase();
    const now = Date.now();

    const payload = {
      promocode_id: input.promocode_id ?? null,
      primary_email: normalizedEmail,
      status: input.status ?? 'active',
      start_date: input.start_date ?? now,
      end_date: input.end_date ?? null,
      payment_method: input.payment_method ?? 'flouci',
      transaction_record: input.transaction_record ?? null,
      plan_type: input.plan_type,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const subRef = await addDoc(subsRef, payload);

    if (input.promocode_id) {
      const promoRef = doc(this.firestore!, 'promocodes', input.promocode_id);
      await updateDoc(promoRef, {
        redemption_count: increment(1),
        updatedAt: serverTimestamp(),
      });

      const promoSnap = await getDoc(promoRef);
      if (promoSnap.exists()) {
        const promoData = promoSnap.data() as any;
        const assignedAgent = promoData['assigned_agent_id'];
        if (assignedAgent) {
          const commissionAmount = PLAN_PRICES[input.plan_type] * COMMISSION_RATE;
          await addDoc(collection(this.firestore!, 'agent_promocode_commissions'), {
            agent_id: assignedAgent,
            promocode_id: input.promocode_id,
            subscription_id: subRef.id,
            commission_status: 'unpaid',
            amount: commissionAmount,
            currency: 'USD',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
      }
    }

    return {
      id: subRef.id,
      promocode_id: input.promocode_id,
      primary_email: normalizedEmail,
      status: input.status ?? 'active',
      start_date: input.start_date ?? now,
      end_date: input.end_date,
      payment_method: input.payment_method ?? 'flouci',
      transaction_record: input.transaction_record,
      plan_type: input.plan_type,
      createdAt: now,
      updatedAt: now,
    };
  }

  setCommissionStatus(ids: string[], status: CommissionStatus): Observable<void> {
    if (!this.firestore) {
      const list = this.commissions$.value.map((c) =>
        ids.includes(c.id) ? { ...c, commission_status: status, updatedAt: Date.now() } : c
      );
      this.commissions$.next(list);
      return of(void 0);
    }

    const updates = ids.map((id) =>
      updateDoc(doc(this.firestore!, 'agent_promocode_commissions', id), {
        commission_status: status,
        updatedAt: serverTimestamp(),
      })
    );
    return from(Promise.all(updates)).pipe(map(() => void 0));
  }

  // Metrics helpers
  getTotalsForMonth(year: number, monthIndex: number): Observable<{
    unpaid: number; paid: number; count: number;
  }> {
    if (!this.firestore && this.demoMonthTotals) {
      return of(this.demoMonthTotals);
    }
    const start = new Date(year, monthIndex, 1).getTime();
    const end = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999).getTime();
    return this.getCommissions().pipe(
      map(list => {
        const inRange = list.filter(c => c.createdAt >= start && c.createdAt <= end);
        const unpaid = inRange.filter(c => c.commission_status === 'unpaid').reduce((s, c) => s + c.amount, 0);
        const paid = inRange.filter(c => c.commission_status === 'paid').reduce((s, c) => s + c.amount, 0);
        return { unpaid, paid, count: inRange.length };
      })
    );
  }
}

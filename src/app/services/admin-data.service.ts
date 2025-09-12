import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, of } from 'rxjs';
import { Agent } from '../models/agent.model';
import { PromoCode } from '../models/promocode.model';
import { AgentPromoCodeCommission, CommissionStatus } from '../models/commission.model';
import { Subscription } from '../models/subscription.model';

// Simple seeded prices. Adjust as needed.
const PLAN_PRICES: Record<Subscription['plan_type'], number> = {
  basic: 49,
  pro: 99,
  enterprise: 199
};

const COMMISSION_RATE = 0.2; // 20% of plan price for first month

@Injectable({ providedIn: 'root' })
export class AdminDataService {
  private agents$ = new BehaviorSubject<Agent[]>([]);
  private promoCodes$ = new BehaviorSubject<PromoCode[]>([]);
  private subscriptions$ = new BehaviorSubject<Subscription[]>([]);
  private commissions$ = new BehaviorSubject<AgentPromoCodeCommission[]>([]);

  constructor() {
    this.seed();
  }

  // Seed with minimal data for demo/dev
  private seed(): void {
    const now = Date.now();
    const agentA: Agent = {
      id: 'ag_1',
      displayName: 'Alice Sales',
      email: 'alice@agency.com',
      createdAt: now - 1000 * 60 * 60 * 24 * 40
    };
    const agentB: Agent = {
      id: 'ag_2',
      displayName: 'Bob Sales',
      email: 'bob@agency.com',
      createdAt: now - 1000 * 60 * 60 * 24 * 10
    };

    const promo1: PromoCode = {
      id: 'pc_1',
      code: 'ALICE20',
      assigned_agent_id: agentA.id,
      discount_type: 'percentage',
      discount_value: 20,
      redemption_count: 2,
      status: 'active',
      createdAt: now - 1000 * 60 * 60 * 24 * 30
    };
    const promo2: PromoCode = {
      id: 'pc_2',
      code: 'BOB10',
      assigned_agent_id: agentB.id,
      discount_type: 'fixed',
      discount_value: 10,
      redemption_count: 1,
      status: 'active',
      createdAt: now - 1000 * 60 * 60 * 24 * 15
    };

    const s1: Subscription = {
      id: 'sub_1',
      promocode_id: promo1.id,
      primary_email: 'clinic.one@example.com',
      status: 'active',
      start_date: now - 1000 * 60 * 60 * 24 * 14,
      plan_type: 'pro',
      payment_method: 'flouci',
      createdAt: now - 1000 * 60 * 60 * 24 * 14
    };

    const s2: Subscription = {
      id: 'sub_2',
      promocode_id: promo2.id,
      primary_email: 'clinic.two@example.com',
      status: 'active',
      start_date: now - 1000 * 60 * 60 * 24 * 3,
      plan_type: 'basic',
      payment_method: 'flouci',
      createdAt: now - 1000 * 60 * 60 * 24 * 3
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
      updatedAt: now
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
      updatedAt: now
    };

    this.agents$.next([agentA, agentB]);
    this.promoCodes$.next([promo1, promo2]);
    this.subscriptions$.next([s1, s2]);
    this.commissions$.next([c1, c2]);
  }

  // Streams
  getAgents(): Observable<Agent[]> { return this.agents$.asObservable(); }
  getPromoCodes(): Observable<PromoCode[]> { return this.promoCodes$.asObservable(); }
  getSubscriptions(): Observable<Subscription[]> { return this.subscriptions$.asObservable(); }
  getCommissions(): Observable<AgentPromoCodeCommission[]> { return this.commissions$.asObservable(); }

  // CRUD-like operations (mock)
  createAgent(input: Omit<Agent, 'id' | 'createdAt'> & Partial<Pick<Agent,'createdAt'>>): Observable<Agent> {
    const agent: Agent = { id: 'ag_' + crypto.randomUUID(), createdAt: input.createdAt ?? Date.now(), displayName: input.displayName, email: input.email, userId: input.userId };
    this.agents$.next([...this.agents$.value, agent]);
    return of(agent);
  }

  createPromoCode(input: Omit<PromoCode, 'id' | 'createdAt' | 'updatedAt' | 'redemption_count' | 'status'> & { status?: PromoCode['status'] }): Observable<PromoCode> {
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
      created_by_admin_id: input.created_by_admin_id
    };
    this.promoCodes$.next([promo, ...this.promoCodes$.value]);
    return of(promo);
  }

  onboardSubscription(input: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'start_date'> & { start_date?: number; status?: Subscription['status'] }): Observable<Subscription> {
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
      updatedAt: Date.now()
    };
    this.subscriptions$.next([sub, ...this.subscriptions$.value]);

    // Link to promo & commission if applicable
    if (sub.promocode_id) {
      const promos = this.promoCodes$.value;
      const p = promos.find(x => x.id === sub.promocode_id);
      if (p) {
        p.redemption_count += 1;
        p.updatedAt = Date.now();
        this.promoCodes$.next([...promos]);

        if (p.assigned_agent_id) {
          const commission: AgentPromoCodeCommission = {
            id: 'cm_' + crypto.randomUUID(),
            agent_id: p.assigned_agent_id,
            promocode_id: p.id,
            subscription_id: sub.id,
            commission_status: 'unpaid',
            amount: PLAN_PRICES[sub.plan_type] * COMMISSION_RATE,
            currency: 'USD',
            createdAt: sub.start_date,
            updatedAt: Date.now()
          };
          this.commissions$.next([commission, ...this.commissions$.value]);
        }
      }
    }

    return of(sub);
  }

  setCommissionStatus(ids: string[], status: CommissionStatus): Observable<void> {
    const list = this.commissions$.value.map(c => ids.includes(c.id) ? { ...c, commission_status: status, updatedAt: Date.now() } : c);
    this.commissions$.next(list);
    return of(void 0);
  }

  // Metrics helpers
  getTotalsForMonth(year: number, monthIndex: number): Observable<{
    unpaid: number; paid: number; count: number;
  }> {
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


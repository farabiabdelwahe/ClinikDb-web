import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, combineLatest, map, of } from 'rxjs';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { AdminDataService } from '../services/admin-data.service';
import { Agent } from '../models/agent.model';
import { PromoCode } from '../models/promocode.model';
import { Subscription } from '../models/subscription.model';
import { AgentPromoCodeCommission } from '../models/commission.model';
import { LucideAngularModule, LayoutDashboard, Tags, CreditCard, Wallet, Users, TrendingUp, BadgePercent } from 'lucide-angular';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective, LucideAngularModule],
  templateUrl: './admin-dashboard.component.html'
})
export class AdminDashboardComponent implements OnInit {
  private data = inject(AdminDataService);

  // Icons
  readonly ILayout = LayoutDashboard;
  readonly ITags = Tags;
  readonly ICreditCard = CreditCard;
  readonly IWallet = Wallet;
  readonly IUsers = Users;
  readonly ITrendingUp = TrendingUp;
  readonly IPercent = BadgePercent;

  // Streams
  agents$!: Observable<Agent[]>;
  promoCodes$!: Observable<PromoCode[]>;
  subscriptions$!: Observable<Subscription[]>;
  commissions$!: Observable<AgentPromoCodeCommission[]>;

  // UI state
  activeTab: 'overview' | 'promocodes' | 'subscriptions' | 'commissions' | 'agents' = 'overview';

  // Overview totals
  totalCommission = 0;
  monthUnpaid = 0;
  monthPaid = 0;
  monthCount = 0;

  // Create promo code form
  newPromo: Partial<PromoCode> = { code: '', assigned_agent_id: undefined, discount_type: 'percentage', discount_value: 10, status: 'active' };

  // Onboard subscription form
  newSub: Partial<Subscription> = { primary_email: '', promocode_id: undefined, plan_type: 'basic', payment_method: 'flouci' };

  // Selection state for commissions payout
  selectedCommissionIds = new Set<string>();

  // Charts
  lineChartData: ChartData<'line'> = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        data: [120, 90, 150, 200, 240, 210, 260, 300, 270, 320, 310, 380],
        label: 'Commission ($)',
        tension: 0.35,
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99,102,241,0.15)',
        fill: true,
        pointRadius: 3
      }
    ]
  };

  lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: '#eef2ff' } }
    }
  };

  doughnutChartData: ChartData<'doughnut'> = {
    labels: ['Direct', 'Referral', 'Promo Codes'],
    datasets: [
      {
        data: [45, 25, 30],
        backgroundColor: ['#3b82f6', '#8b5cf6', '#22c55e']
      }
    ]
  };

  doughnutChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } }
  };

  ngOnInit(): void {
    this.agents$ = this.data.getAgents();
    this.promoCodes$ = this.data.getPromoCodes();
    this.subscriptions$ = this.data.getSubscriptions();
    this.commissions$ = this.data.getCommissions();

    // Totals
    this.commissions$.subscribe(list => {
      this.totalCommission = list.reduce((s, c) => s + c.amount, 0);
    });

    const today = new Date();
    this.data.getTotalsForMonth(today.getFullYear(), today.getMonth()).subscribe(totals => {
      this.monthUnpaid = totals.unpaid;
      this.monthPaid = totals.paid;
      this.monthCount = totals.count;
    });
  }

  // Actions
  createPromo(): void {
    if (!this.newPromo.code || !this.newPromo.discount_type) return;
    this.data.createPromoCode({
      code: this.newPromo.code!,
      assigned_agent_id: this.newPromo.assigned_agent_id,
      discount_type: this.newPromo.discount_type!,
      discount_value: Number(this.newPromo.discount_value ?? 0),
      valid_from: this.newPromo.valid_from,
      valid_to: this.newPromo.valid_to,
      status: this.newPromo.status ?? 'active'
    }).subscribe(() => {
      this.newPromo = { code: '', assigned_agent_id: undefined, discount_type: 'percentage', discount_value: 10, status: 'active' };
      this.activeTab = 'promocodes';
    });
  }

  onboardSubscription(): void {
    if (!this.newSub.primary_email || !this.newSub.plan_type) return;
    this.data.onboardSubscription({
      primary_email: this.newSub.primary_email!,
      plan_type: this.newSub.plan_type!,
      promocode_id: this.newSub.promocode_id,
      payment_method: this.newSub.payment_method ?? 'flouci'
    }).subscribe(() => {
      this.newSub = { primary_email: '', promocode_id: undefined, plan_type: 'basic', payment_method: 'flouci' };
      this.activeTab = 'subscriptions';
    });
  }

  markSelectedPaid(selected: Set<string>): void {
    const ids = Array.from(selected);
    if (!ids.length) return;
    this.data.setCommissionStatus(ids, 'paid').subscribe();
  }

  toggleCommission(id: string, checked: boolean): void {
    if (checked) this.selectedCommissionIds.add(id);
    else this.selectedCommissionIds.delete(id);
    // Trigger change detection by replacing the set reference if needed in future
  }

  agentName(agentId?: string | null, agents?: Agent[] | null): string {
    if (!agentId || !agents) return '';
    return agents.find(a => a.id === agentId)?.displayName || agentId;
  }

  promoCodeLabel(promoId?: string | null, promos?: PromoCode[] | null): string {
    if (!promoId || !promos) return '';
    return promos.find(p => p.id === promoId)?.code || promoId;
  }
}

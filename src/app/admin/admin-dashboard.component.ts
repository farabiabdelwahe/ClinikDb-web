import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { AdminDataService } from '../services/admin-data.service';
import { Agent } from '../models/agent.model';
import { PromoCode } from '../models/promocode.model';
import { Subscription } from '../models/subscription.model';
import { AgentPromoCodeCommission } from '../models/commission.model';
import { AppUser } from '../models/app-user.model';
import { LucideAngularModule, LayoutDashboard, Tags, CreditCard, Wallet, Users, TrendingUp, BadgePercent, PenSquare, Trash2, X } from 'lucide-angular';
import { environment } from '../../environments/environment';
import dashboardDemo from '../../assets/mock/admin-dashboard-demo.json';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective, LucideAngularModule],
  templateUrl: './admin-dashboard.component.html'
})
export class AdminDashboardComponent implements OnInit {
  private data = inject(AdminDataService);
  private readonly useDemoData = environment.features?.useDashboardMockData === true;
  private readonly demoCharts = this.useDemoData ? dashboardDemo?.overview?.charts ?? null : null;

  // Icons
  readonly ILayout = LayoutDashboard;
  readonly ITags = Tags;
  readonly ICreditCard = CreditCard;
  readonly IWallet = Wallet;
  readonly IUsers = Users;
  readonly ITrendingUp = TrendingUp;
  readonly IPercent = BadgePercent;
  readonly IEdit = PenSquare;
  readonly ITrash = Trash2;
  readonly IClose = X;

  // Streams
  agents$!: Observable<Agent[]>;
  promoCodes$!: Observable<PromoCode[]>;
  subscriptions$!: Observable<Subscription[]>;
  commissions$!: Observable<AgentPromoCodeCommission[]>;
  doctors$!: Observable<AppUser[]>;

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

  // Onboard people
  newAgent = { displayName: '', email: '' };
  newDoctor = { displayName: '', email: '' };

  // Selection state for commissions payout
  selectedCommissionIds = new Set<string>();

  // Charts
  lineChartData: ChartData<'line'> = {
    labels: this.demoCharts?.commissionsByMonth?.labels ?? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        data: this.demoCharts?.commissionsByMonth?.values ?? [120, 90, 150, 200, 240, 210, 260, 300, 270, 320, 310, 380],
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
    labels: this.demoCharts?.acquisitionSplit?.labels ?? ['Direct', 'Referral', 'Promo Codes'],
    datasets: [
      {
        data: this.demoCharts?.acquisitionSplit?.values ?? [45, 25, 30],
        backgroundColor: ['#3b82f6', '#8b5cf6', '#22c55e']
      }
    ]
  };

  doughnutChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } }
  };

  // Edit overlays
  activeEditor: { type: 'promo' | 'subscription' | 'agent' | 'doctor'; title: string } | null = null;
  editPromoForm: Partial<PromoCode> & { id?: string } = {};
  editSubscriptionForm: Partial<Subscription> & { id?: string } = {};
  editAgentForm: Partial<Agent> & { id?: string } = {};
  editDoctorForm: Partial<AppUser> & { id?: string } = {};

  readonly subscriptionStatuses: Subscription['status'][] = ['active', 'inactive', 'expired'];

  ngOnInit(): void {
    this.agents$ = this.data.getAgents();
    this.promoCodes$ = this.data.getPromoCodes();
    this.subscriptions$ = this.data.getSubscriptions();
    this.commissions$ = this.data.getCommissions();
    this.doctors$ = this.data.getDoctors();

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

  inviteAgent(): void {
    const email = this.newAgent.email.trim().toLowerCase();
    if (!this.newAgent.displayName.trim() || !email) {
      return;
    }

    this.data.inviteAgent({
      displayName: this.newAgent.displayName.trim(),
      email,
    }).subscribe({
      next: () => {
        this.newAgent = { displayName: '', email: '' };
        this.activeTab = 'agents';
      },
      error: (err) => console.error('Failed to invite agent', err),
    });
  }

  inviteDoctor(): void {
    const email = this.newDoctor.email.trim().toLowerCase();
    if (!this.newDoctor.displayName.trim() || !email) {
      return;
    }

    this.data.inviteDoctor({
      displayName: this.newDoctor.displayName.trim(),
      email,
    }).subscribe({
      next: () => {
        this.newDoctor = { displayName: '', email: '' };
        // keep current tab
      },
      error: (err) => console.error('Failed to invite doctor', err),
    });
  }

  // Editor helpers
  openEditPromo(promo: PromoCode): void {
    this.editPromoForm = { ...promo };
    this.activeEditor = { type: 'promo', title: `Edit ${promo.code}` };
  }

  savePromoEdit(): void {
    if (!this.editPromoForm.id) {
      return;
    }
    const { id, ...changes } = this.editPromoForm;
    this.data.updatePromoCode(id, changes).subscribe({
      next: () => {
        this.closeEditor();
      },
      error: (err) => console.error('Failed to update promo code', err)
    });
  }

  deletePromo(promo: PromoCode): void {
    if (!confirm(`Delete promo code ${promo.code}?`)) {
      return;
    }
    this.data.deletePromoCode(promo.id).subscribe({
      error: (err) => console.error('Failed to delete promo code', err)
    });
  }

  openEditSubscription(sub: Subscription): void {
    this.editSubscriptionForm = { ...sub };
    this.activeEditor = { type: 'subscription', title: `Edit ${sub.primary_email}` };
  }

  saveSubscriptionEdit(): void {
    if (!this.editSubscriptionForm.id) {
      return;
    }
    const { id, ...changes } = this.editSubscriptionForm;
    this.data.updateSubscription(id, changes).subscribe({
      next: () => this.closeEditor(),
      error: (err) => console.error('Failed to update subscription', err)
    });
  }

  deleteSubscription(sub: Subscription): void {
    if (!confirm(`Delete subscription for ${sub.primary_email}?`)) {
      return;
    }
    this.data.deleteSubscription(sub.id).subscribe({
      error: (err) => console.error('Failed to delete subscription', err)
    });
  }

  openEditAgent(agent: Agent): void {
    this.editAgentForm = { ...agent };
    this.activeEditor = { type: 'agent', title: `Edit ${agent.displayName}` };
  }

  saveAgentEdit(): void {
    if (!this.editAgentForm.id) {
      return;
    }
    const { id, ...changes } = this.editAgentForm;
    this.data.updateAgent(id, changes).subscribe({
      next: () => this.closeEditor(),
      error: (err) => console.error('Failed to update agent', err)
    });
  }

  deleteAgent(agent: Agent): void {
    if (!confirm(`Remove agent ${agent.displayName}?`)) {
      return;
    }
    this.data.deleteAgent(agent.id).subscribe({
      error: (err) => console.error('Failed to delete agent', err)
    });
  }

  openEditDoctor(doctor: AppUser): void {
    this.editDoctorForm = { ...doctor };
    this.activeEditor = { type: 'doctor', title: `Edit ${doctor.displayName}` };
  }

  saveDoctorEdit(): void {
    if (!this.editDoctorForm.id) {
      return;
    }
    const { id, ...rest } = this.editDoctorForm;
    const { role: _role, ...changes } = rest;
    this.data.updateDoctor(id, changes).subscribe({
      next: () => this.closeEditor(),
      error: (err) => console.error('Failed to update doctor', err)
    });
  }

  deleteDoctor(doctor: AppUser): void {
    if (!confirm(`Remove doctor ${doctor.displayName}?`)) {
      return;
    }
    this.data.deleteDoctor(doctor.id).subscribe({
      error: (err) => console.error('Failed to delete doctor', err)
    });
  }

  closeEditor(): void {
    this.activeEditor = null;
    this.editPromoForm = {};
    this.editSubscriptionForm = {};
    this.editAgentForm = {};
    this.editDoctorForm = {};
  }
}

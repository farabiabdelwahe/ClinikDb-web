export type CommissionStatus = 'paid' | 'unpaid';

export interface AgentPromoCodeCommission {
  id: string;
  agent_id: string;
  promocode_id: string;
  subscription_id?: string;
  commission_status: CommissionStatus;
  amount: number;
  currency: string;
  updatedAt: number;
  createdAt: number;
}


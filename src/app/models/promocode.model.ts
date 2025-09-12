export type DiscountType = 'fixed' | 'percentage';
export type PromoStatus = 'active' | 'inactive';

export interface PromoCode {
  id: string;
  code: string;
  assigned_agent_id?: string; // Agent.id
  linked_subscription_id?: string; // first subscription acquired via this code (optional)
  discount_type: DiscountType;
  discount_value: number; // amount or percentage depending on type
  valid_from?: number; // epoch ms
  valid_to?: number; // epoch ms
  redemption_count: number;
  status: PromoStatus;
  createdAt: number;
  updatedAt?: number;
  created_by_admin_id?: string;
}


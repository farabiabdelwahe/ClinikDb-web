export type SubscriptionStatus = 'active' | 'inactive' | 'expired';

export interface Subscription {
  id: string;
  promocode_id?: string;
  primary_email: string;
  status: SubscriptionStatus;
  start_date: number;
  end_date?: number;
  payment_method?: string; // e.g., 'flouci'
  transaction_record?: string; // gateway transaction id / payload
  plan_type: 'basic' | 'pro' | 'enterprise';
  createdAt: number;
  updatedAt?: number;
}


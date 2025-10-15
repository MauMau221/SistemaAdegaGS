export interface CashStatus {
  is_open: boolean;
  opened_at?: string;
  opened_by?: string;
  initial_amount: number;
  current_amount: number;
}

export interface CashTransaction {
  id: string;
  type: 'entrada' | 'saida';
  amount: number;
  description: string;
  created_at: string;
  created_by: string;
}

export interface CashReport {
  date: string;
  opening_balance: number;
  closing_balance: number;
  total_income: number;
  total_outcome: number;
  transactions: CashTransaction[];
}
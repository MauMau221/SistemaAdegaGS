export interface DashboardSummary {
  sales: {
    total_amount: number;
    total_orders: number;
  };
  orders: {
    pending: number;
    delivering: number;
    completed: number;
  };
  cash: {
    is_open: boolean;
    current_amount: number;
  };
  stock: {
    total_products: number;
    low_stock_count: number;
  };
}

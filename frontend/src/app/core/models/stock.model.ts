import { User } from './auth.model';
import { Product } from './product.model';

export interface StockMovement {
  id: number;
  product_id: number;
  user_id: number;
  type: 'entrada' | 'saida' | 'ajuste';
  quantity: number;
  description?: string;
  unit_cost?: number;
  created_at: string;
  updated_at: string;
  user?: User;
  product?: Product;
}

export interface StockSummary {
  total_products: number;
  low_stock_count: number;
  out_of_stock_count: number;
  total_stock_value: number;
}

export interface StockUpdateRequest {
  quantity: number;
  type: 'entrada' | 'saida' | 'ajuste';
  description?: string;
  unit_cost?: number;
}

export interface StockFilters {
  search?: string;
  low_stock?: boolean;
}

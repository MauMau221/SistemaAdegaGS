import { Product } from './product.model';

export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
  price: number;
}

export interface CartState {
  items: CartItem[];
  total: number;
  isOpen: boolean;
}

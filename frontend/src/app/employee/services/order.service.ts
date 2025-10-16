import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, interval } from 'rxjs';
import { switchMap, tap, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Product as CoreProduct } from '../../core/models/product.model';

export interface OrderSummary {
  total_amount: number;
  total_orders: number;
  pending: number;
  delivering: number;
  completed: number;
}

export type OrderStatus = 'pending' | 'delivering' | 'completed' | 'cancelled';
export type PaymentMethod = 'dinheiro' | 'cartão de débito' | 'cartão de crédito' | 'pix';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface Product extends CoreProduct {
  stock_quantity: number;
}

export interface OrderItem {
  id: number;
  product: Product;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Payment {
  id: number;
  payment_method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  created_at: string;
}

export interface Order {
  id: number;
  order_number: string;
  user: {
    id: number;
    name: string;
    email: string;
    phone?: string;
  };
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  payment?: Payment;
  payment_method?: PaymentMethod;
  customer_name?: string;
  customer_phone?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateOrderRequest {
  items: {
    product_id: number;
    quantity: number;
    price: number;
  }[];
  total: number;
  payment_method: PaymentMethod;
  customer_name?: string;
  customer_phone?: string;
}

export interface CreateOrderResponse extends Order {
  items: (OrderItem & { product_name?: string })[];
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = `${environment.apiUrl}/orders`;
  private ordersSubject = new BehaviorSubject<Order[]>([]);
  private autoRefreshInterval = 15000; // 15 segundos

  orders$ = this.ordersSubject.asObservable();

  constructor(private http: HttpClient) {
    // Iniciar atualização automática
    this.startAutoRefresh();
  }

  private startAutoRefresh() {
    interval(this.autoRefreshInterval)
      .pipe(
        switchMap(() => this.fetchOrders())
      )
      .subscribe();
  }

  fetchOrders(filters?: { status?: OrderStatus }): Observable<Order[]> {
    let params = {};
    if (filters?.status) {
      params = { status: filters.status };
    }

    return this.http.get<Order[]>(this.apiUrl, { params }).pipe(
      tap(orders => this.ordersSubject.next(orders))
    );
  }

  updateOrderStatus(orderId: number, status: OrderStatus): Observable<Order> {
    return this.http.patch<Order>(`${this.apiUrl}/${orderId}/status`, { status }).pipe(
      tap((updatedOrder) => {
        // Atualizar a lista local
        const currentOrders = this.ordersSubject.value;
        const updatedOrders = currentOrders.map(order => 
          order.id === orderId ? updatedOrder : order
        );
        this.ordersSubject.next(updatedOrders);
      })
    );
  }

  createOrder(order: CreateOrderRequest): Observable<CreateOrderResponse> {
    return this.http.post<CreateOrderResponse>(`${this.apiUrl}/create`, order).pipe(
      tap(() => {
        // Recarregar a lista de pedidos após criar um novo
        this.fetchOrders().subscribe();
      })
    );
  }

  getOrdersSummary(): Observable<OrderSummary> {
    // Se tiver endpoint específico:
    // return this.http.get<OrderSummary>(`${this.apiUrl}/summary`);

    // Caso contrário, calcular do estado local
    return this.orders$.pipe(
      map(orders => ({
        total_amount: orders.reduce((sum, order) => sum + order.total, 0),
        total_orders: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        delivering: orders.filter(o => o.status === 'delivering').length,
        completed: orders.filter(o => o.status === 'completed').length
      }))
    );
  }

  generateOrderPrint(orderId: number): Observable<string> {
    // Aqui você pode implementar a lógica de geração do HTML para impressão
    // ou chamar um endpoint específico do backend se existir
    return this.http.get<Order>(`${this.apiUrl}/${orderId}`).pipe(
      map(order => this.generatePrintHTML(order))
    );
  }

  private generatePrintHTML(order: Order): string {
    // Template básico para impressão
    return `
      <div style="font-family: monospace; width: 300px; padding: 10px;">
        <h2>ADEGA GS - Pedido #${order.order_number}</h2>
        <p>Data: ${new Date(order.created_at).toLocaleString()}</p>
        <p>Cliente: ${order.user.name}</p>
        <hr>
        ${order.items.map(item => `
          <div>
            ${item.quantity}x ${item.product.name}
            <span style="float: right">R$ ${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        `).join('')}
        <hr>
        <p style="text-align: right; font-weight: bold;">
          Total: R$ ${order.total.toFixed(2)}
        </p>
        <p>Forma de pagamento: ${order.payment?.payment_method || 'Não informado'}</p>
        <p>Status: ${this.getStatusLabel(order.status)}</p>
      </div>
    `;
  }

  private getStatusLabel(status: OrderStatus): string {
    const labels = {
      pending: 'Pendente',
      delivering: 'Em Entrega',
      completed: 'Concluído',
      cancelled: 'Cancelado'
    };
    return labels[status];
  }
}
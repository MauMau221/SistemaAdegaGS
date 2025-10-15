import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../core/models/order.model';

@Component({
  selector: 'app-orders-list',
  templateUrl: './orders-list.component.html',
  styleUrls: ['./orders-list.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule
  ]
})
export class OrdersListComponent implements OnInit {
  orders: Order[] = [];
  loading = true;
  error: string | null = null;

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.error = null;

    console.log('OrdersListComponent: Loading orders...');

    this.orderService.getOrders().subscribe({
      next: (orders) => {
        console.log('OrdersListComponent: Orders received:', orders);
        this.orders = orders;
        this.loading = false;
      },
      error: (error) => {
        console.error('OrdersListComponent: Error loading orders:', error);
        this.error = error.error?.message || 'Erro ao carregar pedidos';
        this.loading = false;
      }
    });
  }

  getStatusLabel(status: string): string {
    const statusMap: { [key: string]: string } = {
      'pending': 'Pendente',
      'processing': 'Em Processamento',
      'paid': 'Pago',
      'shipped': 'Enviado',
      'delivered': 'Entregue',
      'cancelled': 'Cancelado',
      'refunded': 'Reembolsado',
      'completed': 'Concluído'
    };
    return statusMap[status] || status;
  }

  getStatusClass(status: string): string {
    const classMap: { [key: string]: string } = {
      'pending': 'status-pending',
      'processing': 'status-processing',
      'paid': 'status-paid',
      'shipped': 'status-shipped',
      'delivered': 'status-delivered',
      'completed': 'status-completed',
      'cancelled': 'status-cancelled',
      'refunded': 'status-refunded'
    };
    return classMap[status] || 'status-default';
  }

  getPaymentMethodLabel(method: string): string {
    const methodMap: { [key: string]: string } = {
      'pix': 'PIX',
      'cash': 'Dinheiro',
      'card': 'Cartão'
    };
    return methodMap[method] || method;
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}


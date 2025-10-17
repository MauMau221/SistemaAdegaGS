import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, takeUntil, interval } from 'rxjs';

import { OrderService, Order, OrderStatus } from '../../services/order.service';
import { PrintService } from '../../../core/services/print.service';
import { UpdateOrderStatusDialogComponent } from './dialogs/update-order-status-dialog.component';
import { OrderDetailsDialogComponent } from './dialogs/order-details-dialog.component';

@Component({
  selector: 'app-pedidos',
  templateUrl: './pedidos.component.html',
  styleUrls: ['./pedidos.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatBadgeModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatButtonToggleModule,
    MatTooltipModule
  ]
})
export class PedidosComponent implements OnInit, OnDestroy {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  displayedColumns = ['id', 'created_at', 'customer', 'address', 'items', 'total', 'status', 'actions'];
  loading = true;
  selectedStatus: OrderStatus | 'all' = 'pending';
  lastOrderCount = 0;
  hasNewOrders = false;
  private destroy$ = new Subject<void>();

  constructor(
    private orderService: OrderService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private printService: PrintService
  ) {}

  ngOnInit(): void {
    // Carregar todos os pedidos uma única vez
    this.loadAllOrders();
    
    // Configurar verificação periódica de novos pedidos
    this.setupOrderNotifications();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setupOrderNotifications(): void {
    // Verificar novos pedidos a cada 10 segundos
    interval(10000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.checkForNewOrders();
      });
  }

  checkForNewOrders(): void {
    this.orderService.fetchOrders()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (newOrders: Order[]) => {
          const currentOrderCount = newOrders.length;
          
          if (this.lastOrderCount > 0 && currentOrderCount > this.lastOrderCount) {
            const newOrderCount = currentOrderCount - this.lastOrderCount;
            this.hasNewOrders = true;
            
            // Mostrar notificação
            this.snackBar.open(
              `🎉 ${newOrderCount} novo${newOrderCount > 1 ? 's' : ''} pedido${newOrderCount > 1 ? 's' : ''} recebido${newOrderCount > 1 ? 's' : ''}!`,
              'Ver Pedidos',
              {
                duration: 5000,
                panelClass: ['success-snackbar']
              }
            );
            
            // Atualizar dados locais
            this.orders = newOrders;
            this.filterOrders();
          }
          
          this.lastOrderCount = currentOrderCount;
        },
        error: (error: any) => {
          console.error('Erro ao verificar novos pedidos:', error);
        }
      });
  }

  loadAllOrders(): void {
    this.loading = true;
    
    // Carregar todos os pedidos sem filtro
    this.orderService.fetchOrders().subscribe({
      next: (orders: Order[]) => {
        this.orders = orders;
        this.filterOrders();
        this.loading = false;
      },
      error: (error: Error) => {
        console.error('Erro ao carregar pedidos:', error);
        this.snackBar.open('Erro ao carregar pedidos', 'Fechar', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  filterOrders(): void {
    this.filteredOrders = this.selectedStatus === 'all'
      ? this.orders
      : this.orders.filter(order => order.status === this.selectedStatus);
  }

  onStatusFilterChange(status: OrderStatus | 'all'): void {
    this.selectedStatus = status;
    this.filterOrders(); // Filtro local, sem nova requisição
  }

  showDetails(order: Order): void {
    this.dialog.open(OrderDetailsDialogComponent, {
      data: {
        order,
        getStatusColor: this.getStatusColor.bind(this),
        getStatusLabel: this.getStatusLabel.bind(this),
        formatCurrency: this.formatCurrency.bind(this),
        formatDate: this.formatDate.bind(this),
        printOrder: this.printOrder.bind(this)
      },
      width: '600px'
    });
  }

  updateStatus(order: Order): void {
    const dialogRef = this.dialog.open(UpdateOrderStatusDialogComponent, {
      width: '400px',
      data: { currentStatus: order.status }
    });

    dialogRef.afterClosed().subscribe((newStatus?: OrderStatus) => {
      if (newStatus) {
        this.orderService.updateOrderStatus(order.id, newStatus).subscribe({
          next: (updatedOrder) => {
            // Atualizar o pedido na lista local
            const index = this.orders.findIndex(o => o.id === order.id);
            if (index !== -1) {
              this.orders[index] = updatedOrder;
              this.filterOrders(); // Re-filtrar para atualizar a exibição
            }
            this.snackBar.open('Status atualizado com sucesso', 'Fechar', { duration: 3000 });
          },
          error: (error: Error) => {
            console.error('Erro ao atualizar status:', error);
            this.snackBar.open('Erro ao atualizar status', 'Fechar', { duration: 3000 });
          }
        });
      }
    });
  }

  printOrder(order: Order): void {
    this.printService.printOrder(order);
  }

  getStatusColor(status: OrderStatus): string {
    const colors = {
      pending: '#ff9800',      // Laranja
      delivering: '#2196f3',   // Azul
      completed: '#4caf50',    // Verde
      cancelled: '#f44336'     // Vermelho
    };
    return colors[status];
  }

  getStatusLabel(status: OrderStatus): string {
    const labels = {
      pending: 'Pendente',
      delivering: 'Em Entrega',
      completed: 'Concluído',
      cancelled: 'Cancelado'
    };
    return labels[status];
  }

  // Métodos computados para contagem de pedidos por status
  getPendingCount(): number {
    return this.orders.filter(o => o.status === 'pending').length;
  }

  getDeliveringCount(): number {
    return this.orders.filter(o => o.status === 'delivering').length;
  }

  getCompletedCount(): number {
    return this.orders.filter(o => o.status === 'completed').length;
  }

  getCancelledCount(): number {
    return this.orders.filter(o => o.status === 'cancelled').length;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
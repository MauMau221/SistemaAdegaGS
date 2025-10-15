import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { Order, OrderStatus } from '../../../services/order.service';

@Component({
  selector: 'app-order-details-dialog',
  template: `
    <h2 mat-dialog-title>Detalhes do Pedido #{{data.order.order_number}}</h2>
    <mat-dialog-content>
      <!-- Status -->
      <div class="status-section">
        <mat-chip [style.background-color]="data.getStatusColor(data.order.status)"
                 [style.color]="'white'">
          {{data.getStatusLabel(data.order.status)}}
        </mat-chip>
      </div>

      <!-- Cliente -->
      <div class="section">
        <h3>Cliente</h3>
        <p><strong>Nome:</strong> {{data.order.user.name}}</p>
        <p><strong>Email:</strong> {{data.order.user.email}}</p>
        <p *ngIf="data.order.user.phone"><strong>Telefone:</strong> {{data.order.user.phone}}</p>
      </div>

      <mat-divider></mat-divider>

      <!-- Itens -->
      <div class="section">
        <h3>Itens do Pedido</h3>
        <div class="items-list">
          <div *ngFor="let item of data.order.items" class="item">
            <div class="item-details">
              <span class="quantity">{{item.quantity}}x</span>
              <span class="name">{{item.product.name}}</span>
              <span class="price">{{data.formatCurrency(item.price)}}</span>
            </div>
            <div class="subtotal">
              <small>Subtotal: {{data.formatCurrency(item.subtotal)}}</small>
            </div>
          </div>
        </div>
      </div>

      <mat-divider></mat-divider>

      <!-- Pagamento -->
      <div class="section">
        <h3>Pagamento</h3>
        <p><strong>Método:</strong> {{data.order.payment?.payment_method || 'Não informado'}}</p>
        <p><strong>Status:</strong> {{data.order.payment?.status || 'Não informado'}}</p>
        <p class="total"><strong>Total:</strong> {{data.formatCurrency(data.order.total)}}</p>
      </div>

      <!-- Datas -->
      <div class="section">
        <h3>Datas</h3>
        <p><strong>Criado em:</strong> {{data.formatDate(data.order.created_at)}}</p>
        <p><strong>Atualizado em:</strong> {{data.formatDate(data.order.updated_at)}}</p>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close()">Fechar</button>
      <button mat-raised-button 
              color="primary" 
              (click)="data.printOrder(data.order)"
              matTooltip="Imprimir Pedido">
        <mat-icon>print</mat-icon>
        Imprimir
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    :host {
      display: block;
      max-width: 600px;
    }
    .section {
      margin: 20px 0;
    }
    .section h3 {
      color: #666;
      margin-bottom: 10px;
    }
    .status-section {
      margin-bottom: 20px;
    }
    .items-list {
      margin: 10px 0;
    }
    .item {
      margin: 10px 0;
      padding: 10px;
      background-color: #f5f5f5;
      border-radius: 4px;
    }
    .item-details {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .quantity {
      font-weight: bold;
      color: #666;
    }
    .name {
      flex: 1;
    }
    .price {
      color: #666;
    }
    .subtotal {
      margin-top: 5px;
      text-align: right;
      color: #666;
    }
    .total {
      font-size: 1.2em;
      color: #333;
      margin-top: 10px;
    }
    mat-dialog-actions {
      margin-top: 20px;
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule
  ]
})
export class OrderDetailsDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<OrderDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      order: Order;
      getStatusColor: (status: OrderStatus) => string;
      getStatusLabel: (status: OrderStatus) => string;
      formatCurrency: (value: number) => string;
      formatDate: (date: string) => string;
      printOrder: (order: Order) => void;
    }
  ) {}
}
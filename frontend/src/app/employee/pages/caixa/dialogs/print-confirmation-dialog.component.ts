import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface PrintConfirmationData {
  orderNumber: string;
  total: number;
  paymentMethod: string;
  customerName?: string;
  changeAmount?: number;
  receivedAmount?: number;
}

@Component({
  selector: 'app-print-confirmation-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="print-confirmation-dialog">
      <div class="dialog-header">
        <mat-icon class="success-icon">check_circle</mat-icon>
        <h2>Venda Realizada com Sucesso!</h2>
      </div>
      
      <div class="order-info">
        <div class="info-item">
          <span class="label">Pedido:</span>
          <span class="value">#{{ data.orderNumber }}</span>
        </div>
        <div class="info-item">
          <span class="label">Total:</span>
          <span class="value">{{ formatCurrency(data.total) }}</span>
        </div>
        <div class="info-item">
          <span class="label">Pagamento:</span>
          <span class="value">{{ data.paymentMethod }}</span>
        </div>
        <div *ngIf="data.customerName" class="info-item">
          <span class="label">Cliente:</span>
          <span class="value">{{ data.customerName }}</span>
        </div>
        <div *ngIf="data.changeAmount && data.changeAmount > 0" class="info-item">
          <span class="label">Troco:</span>
          <span class="value">{{ formatCurrency(data.changeAmount) }}</span>
        </div>
      </div>

      <div class="dialog-content">
        <p>Deseja imprimir o comprovante de venda?</p>
      </div>

      <div class="dialog-actions">
        <button mat-stroked-button 
                color="warn" 
                (click)="onNoClick()">
          <mat-icon>close</mat-icon>
          Não Imprimir
        </button>
        <button mat-raised-button 
                color="primary" 
                (click)="onYesClick()">
          <mat-icon>print</mat-icon>
          Sim, Imprimir
        </button>
      </div>
    </div>
  `,
  styles: [`
    .print-confirmation-dialog {
      padding: 24px;
      min-width: 400px;
    }

    .dialog-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 24px;
      text-align: center;
      justify-content: center;
    }

    .success-icon {
      font-size: 48px;
      height: 48px;
      width: 48px;
      color: #4caf50;
    }

    .dialog-header h2 {
      margin: 0;
      color: #4caf50;
      font-size: 24px;
      font-weight: 500;
    }

    .order-info {
      background-color: #f5f5f5;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 24px;
    }

    .info-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .info-item:last-child {
      margin-bottom: 0;
    }

    .label {
      font-weight: 500;
      color: rgba(0, 0, 0, 0.6);
    }

    .value {
      font-weight: 600;
      color: #1976d2;
    }

    .dialog-content {
      text-align: center;
      margin-bottom: 24px;
    }

    .dialog-content p {
      margin: 0;
      font-size: 16px;
      color: rgba(0, 0, 0, 0.7);
    }

    .dialog-actions {
      display: flex;
      gap: 12px;
      justify-content: center;
    }

    .dialog-actions button {
      min-width: 140px;
    }
  `]
})
export class PrintConfirmationDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<PrintConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PrintConfirmationData
  ) {}

  onNoClick(): void {
    this.dialogRef.close(false);
  }

  onYesClick(): void {
    this.dialogRef.close(true);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }
}

import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { CashTransaction } from '../../../models/cash.model';

interface DialogData {
  currentAmount: number;
  transactions: CashTransaction[];
}

@Component({
  selector: 'app-close-cash-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatDividerModule
  ],
  template: `
    <h2 mat-dialog-title>Fechar Caixa</h2>
    <mat-dialog-content>
      <div class="summary">
        <div class="summary-item">
          <span class="label">Total de Entradas</span>
          <span class="value positive">{{formatCurrency(totalIncome)}}</span>
        </div>
        <div class="summary-item">
          <span class="label">Total de Saídas</span>
          <span class="value negative">{{formatCurrency(totalOutcome)}}</span>
        </div>
        <mat-divider></mat-divider>
        <div class="summary-item total">
          <span class="label">Saldo Final</span>
          <span class="value">{{formatCurrency(data.currentAmount)}}</span>
        </div>
      </div>

      <div class="confirmation">
        <p>Tem certeza que deseja fechar o caixa?</p>
        <p class="warning">Esta ação não pode ser desfeita.</p>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancelar</button>
      <button mat-raised-button 
              color="warn"
              (click)="onConfirm()">
        Fechar Caixa
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .summary {
      margin-bottom: 24px;
    }
    .summary-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 8px 0;
      font-size: 16px;
    }
    .summary-item.total {
      font-size: 20px;
      font-weight: 500;
      margin-top: 16px;
    }
    .value.positive {
      color: #4caf50;
    }
    .value.negative {
      color: #f44336;
    }
    .confirmation {
      margin-top: 24px;
      text-align: center;
    }
    .warning {
      color: #f44336;
      font-weight: 500;
    }
    mat-dialog-content {
      min-width: 400px;
    }
  `]
})
export class CloseCashDialogComponent {
  totalIncome: number;
  totalOutcome: number;

  constructor(
    private dialogRef: MatDialogRef<CloseCashDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.totalIncome = this.data.transactions
      .filter(t => t.type === 'entrada')
      .reduce((sum, t) => sum + t.amount, 0);

    this.totalOutcome = this.data.transactions
      .filter(t => t.type === 'saida')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}

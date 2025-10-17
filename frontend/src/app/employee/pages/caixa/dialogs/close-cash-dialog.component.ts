import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { CashStatus, CashReport } from '../../../models/cash.model';

interface DialogData {
  cashStatus: CashStatus;
}

@Component({
  selector: 'app-close-cash-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule
  ],
  template: `
    <div class="close-cash-dialog">
      <div class="dialog-header">
        <div class="warning-icon">
          <mat-icon color="warn">warning</mat-icon>
        </div>
        <h2 mat-dialog-title>Fechar Caixa</h2>
        <p class="dialog-subtitle">Confirmação necessária para fechar o caixa</p>
      </div>
      
      <mat-dialog-content>
        <div class="cash-summary">
          <h3>Resumo do Caixa</h3>
          
          <div class="summary-cards">
            <div class="summary-card opening">
              <div class="card-icon">
                <mat-icon>trending_up</mat-icon>
              </div>
              <div class="card-content">
                <span class="card-label">Valor Inicial</span>
                <span class="card-value">{{formatCurrency(data.cashStatus.initial_amount)}}</span>
              </div>
            </div>
            
            <div class="summary-card current">
              <div class="card-icon">
                <mat-icon>account_balance_wallet</mat-icon>
              </div>
              <div class="card-content">
                <span class="card-label">Valor Atual</span>
                <span class="card-value">{{formatCurrency(data.cashStatus.current_amount)}}</span>
              </div>
            </div>
            
            <div class="summary-card difference" [class.positive]="getDifference() >= 0" [class.negative]="getDifference() < 0">
              <div class="card-icon">
                <mat-icon>{{getDifference() >= 0 ? 'trending_up' : 'trending_down'}}</mat-icon>
              </div>
              <div class="card-content">
                <span class="card-label">Diferença</span>
                <span class="card-value">{{formatCurrency(getAbsoluteDifference())}}</span>
              </div>
            </div>
          </div>
        </div>
        
        <mat-divider></mat-divider>
        
        <div class="warning-section">
          <div class="warning-message">
            <mat-icon color="warn">info</mat-icon>
            <div class="warning-text">
              <p><strong>Atenção:</strong> Ao fechar o caixa:</p>
              <ul>
                <li>Todas as vendas pendentes serão perdidas</li>
                <li>O relatório de fechamento será gerado</li>
                <li>Será necessário reabrir o caixa para novas vendas</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div class="confirmation-section">
          <p class="confirmation-question">
            <strong>Você tem certeza que deseja fechar o caixa?</strong>
          </p>
          <p class="confirmation-note">
            Esta ação não pode ser desfeita. Certifique-se de que todas as vendas foram processadas.
          </p>
        </div>
      </mat-dialog-content>
      
      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">
          <mat-icon>cancel</mat-icon>
          Cancelar
        </button>
        <button mat-raised-button 
                color="warn" 
                (click)="onConfirm()"
                class="confirm-button">
          <mat-icon>lock</mat-icon>
          Sim, Fechar Caixa
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .close-cash-dialog {
      max-width: 500px;
      width: 100%;
    }
    
    .dialog-header {
      text-align: center;
      margin-bottom: 24px;
    }
    
    .warning-icon {
      margin-bottom: 16px;
    }
    
    .warning-icon mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
    }
    
    .dialog-subtitle {
      margin: 8px 0 0 0;
      color: rgba(0, 0, 0, 0.6);
      font-size: 14px;
    }
    
    .cash-summary {
      margin: 24px 0;
    }
    
    .cash-summary h3 {
      margin: 0 0 16px 0;
      color: rgba(0, 0, 0, 0.87);
    }
    
    .summary-cards {
      display: grid;
      grid-template-columns: 1fr;
      gap: 12px;
    }
    
    .summary-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      border-radius: 8px;
      border: 1px solid #e0e0e0;
    }
    
    .summary-card.opening {
      background-color: #e3f2fd;
      border-color: #1976d2;
    }
    
    .summary-card.current {
      background-color: #e8f5e8;
      border-color: #4caf50;
    }
    
    .summary-card.difference.positive {
      background-color: #e8f5e8;
      border-color: #4caf50;
    }
    
    .summary-card.difference.negative {
      background-color: #ffebee;
      border-color: #f44336;
    }
    
    .card-icon mat-icon {
      color: #666;
    }
    
    .summary-card.opening .card-icon mat-icon {
      color: #1976d2;
    }
    
    .summary-card.current .card-icon mat-icon {
      color: #4caf50;
    }
    
    .summary-card.difference.positive .card-icon mat-icon {
      color: #4caf50;
    }
    
    .summary-card.difference.negative .card-icon mat-icon {
      color: #f44336;
    }
    
    .card-content {
      display: flex;
      flex-direction: column;
      flex: 1;
    }
    
    .card-label {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.6);
      margin-bottom: 4px;
    }
    
    .card-value {
      font-size: 16px;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.87);
    }
    
    .warning-section {
      margin: 24px 0;
    }
    
    .warning-message {
      display: flex;
      gap: 12px;
      padding: 16px;
      background-color: #fff3e0;
      border: 1px solid #ff9800;
      border-radius: 8px;
    }
    
    .warning-message mat-icon {
      color: #ff9800;
      margin-top: 4px;
    }
    
    .warning-text p {
      margin: 0 0 8px 0;
      color: #e65100;
    }
    
    .warning-text ul {
      margin: 0;
      padding-left: 16px;
      color: #e65100;
    }
    
    .warning-text li {
      margin: 4px 0;
    }
    
    .confirmation-section {
      margin: 24px 0;
      text-align: center;
    }
    
    .confirmation-question {
      margin: 0 0 8px 0;
      font-size: 16px;
      color: rgba(0, 0, 0, 0.87);
    }
    
    .confirmation-note {
      margin: 0;
      font-size: 14px;
      color: rgba(0, 0, 0, 0.6);
    }
    
    mat-dialog-actions {
      margin-top: 24px;
      gap: 8px;
    }
    
    .confirm-button {
      font-weight: 500;
    }
    
    mat-dialog-actions button mat-icon {
      margin-right: 4px;
    }
    
    @media (max-width: 768px) {
      .summary-cards {
        grid-template-columns: 1fr;
      }
      
      .warning-message {
        flex-direction: column;
        gap: 8px;
      }
    }
  `]
})
export class CloseCashDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<CloseCashDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  getDifference(): number {
    return this.data.cashStatus.current_amount - this.data.cashStatus.initial_amount;
  }

  getAbsoluteDifference(): number {
    return Math.abs(this.getDifference());
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-transaction-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  template: `
    <h2 mat-dialog-title>Nova Movimentação</h2>
    <mat-dialog-content>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Tipo</mat-label>
        <mat-select [(ngModel)]="transaction.type" required>
          <mat-option value="entrada">Entrada</mat-option>
          <mat-option value="saida">Saída</mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Valor</mat-label>
        <input matInput type="number" [(ngModel)]="transaction.amount" min="0.01" step="0.01" required>
        <span matPrefix>R$&nbsp;</span>
      </mat-form-field>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Descrição</mat-label>
        <textarea matInput [(ngModel)]="transaction.description" rows="3" required></textarea>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancelar</button>
      <button mat-raised-button 
              color="primary" 
              [disabled]="!isValid()"
              (click)="onConfirm()">
        Confirmar
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }
    mat-dialog-content {
      min-width: 300px;
    }
  `]
})
export class TransactionDialogComponent {
  transaction = {
    type: 'entrada',
    amount: null as number | null,
    description: ''
  };

  constructor(private dialogRef: MatDialogRef<TransactionDialogComponent>) {}

  isValid(): boolean {
    return !!(this.transaction.type && 
              this.transaction.amount && 
              this.transaction.amount > 0 && 
              this.transaction.description);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    if (this.isValid()) {
      this.dialogRef.close(this.transaction);
    }
  }
}

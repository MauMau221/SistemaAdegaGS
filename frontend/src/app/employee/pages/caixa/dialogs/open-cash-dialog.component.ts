import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-open-cash-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule
  ],
  template: `
    <h2 mat-dialog-title>Abrir Caixa</h2>
    <mat-dialog-content>
      <p>Informe o valor inicial do caixa:</p>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Valor Inicial</mat-label>
        <input matInput type="number" [(ngModel)]="initialAmount" min="0" step="0.01" required>
        <span matPrefix>R$&nbsp;</span>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancelar</button>
      <button mat-raised-button 
              color="primary" 
              [disabled]="!initialAmount || initialAmount < 0"
              (click)="onConfirm()">
        Abrir Caixa
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width {
      width: 100%;
    }
    mat-dialog-content {
      min-width: 300px;
    }
  `]
})
export class OpenCashDialogComponent {
  initialAmount: number = 0;

  constructor(private dialogRef: MatDialogRef<OpenCashDialogComponent>) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    if (this.initialAmount >= 0) {
      this.dialogRef.close({ initialAmount: this.initialAmount });
    }
  }
}

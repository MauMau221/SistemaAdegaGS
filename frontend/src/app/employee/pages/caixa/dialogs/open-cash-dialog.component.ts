import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { SettingsService, SystemSettings } from '../../../../admin/services/settings.service';

@Component({
  selector: 'app-open-cash-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>vpn_key</mat-icon>
      Abrir Caixa
    </h2>
    <mat-dialog-content>
      <div class="form-section">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Senha de Administrador</mat-label>
          <input matInput 
                 type="password" 
                 [(ngModel)]="password" 
                 placeholder="Digite a senha"
                 required>
          <mat-icon matSuffix>lock</mat-icon>
        </mat-form-field>
      </div>
      
      <div class="form-section">
        <p>Informe o valor inicial do caixa:</p>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Valor Inicial</mat-label>
          <input matInput 
                 type="number" 
                 [(ngModel)]="initialAmount" 
                 min="0" 
                 step="0.01" 
                 required>
          <span matPrefix>R$&nbsp;</span>
          <mat-icon matSuffix>attach_money</mat-icon>
        </mat-form-field>
      </div>
      
      <div *ngIf="errorMessage" class="error-message">
        <mat-icon color="warn">error</mat-icon>
        <span>{{errorMessage}}</span>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancelar</button>
      <button mat-raised-button 
              color="primary" 
              [disabled]="!password || !initialAmount || initialAmount < 0"
              (click)="onConfirm()">
        <mat-icon>check</mat-icon>
        Abrir Caixa
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width {
      width: 100%;
    }
    
    mat-dialog-content {
      min-width: 350px;
      padding: 16px 24px;
    }
    
    .form-section {
      margin: 16px 0;
    }
    
    .form-section p {
      margin: 8px 0;
      color: rgba(0, 0, 0, 0.6);
      font-size: 14px;
    }
    
    .error-message {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 16px;
      padding: 12px;
      background-color: #ffebee;
      border: 1px solid #f44336;
      border-radius: 4px;
      color: #c62828;
    }
    
    mat-dialog-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    mat-dialog-title mat-icon {
      color: #1976d2;
    }
  `]
})
export class OpenCashDialogComponent {
  initialAmount: number = 0;
  password: string = '';
  errorMessage: string = '';
  settings: SystemSettings | null = null;

  constructor(private dialogRef: MatDialogRef<OpenCashDialogComponent>, private settingsService: SettingsService) {}

  ngOnInit(): void {
    this.settingsService.getSettings().subscribe({
      next: (s) => this.settings = s,
      error: () => {}
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    this.errorMessage = '';
    
    // Validar senha (usa settings se configurada)
    const required = (this.settings && (this.settings as any)['cash_open_password']) || localStorage.getItem('admin_cash_password');
    if (required && this.password !== required) {
      this.errorMessage = 'Senha incorreta. Tente novamente.';
      return;
    }
    
    if (this.initialAmount >= 0) {
      this.dialogRef.close({ initialAmount: this.initialAmount });
    }
  }
}

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { SystemSettings } from '../../../services/settings.service';

@Component({
  selector: 'app-security-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule
  ],
  template: `
    <div class="security-settings">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <mat-icon>security</mat-icon>
            Senha do Caixa
          </mat-card-title>
          <mat-card-subtitle>
            Configure a senha necessária para abrir o caixa
          </mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <div class="password-section">
            <div class="info-text">
              <mat-icon>info</mat-icon>
              <p>Esta senha será solicitada sempre que um funcionário tentar abrir o caixa.</p>
            </div>
            
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Nova Senha</mat-label>
              <input matInput 
                     type="password" 
                     [(ngModel)]="newPassword" 
                     placeholder="Digite a nova senha"
                     minlength="4"
                     required>
              <mat-icon matSuffix>lock</mat-icon>
              <mat-hint>Mínimo de 4 caracteres</mat-hint>
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Confirmar Senha</mat-label>
              <input matInput 
                     type="password" 
                     [(ngModel)]="confirmPassword" 
                     placeholder="Confirme a nova senha"
                     required>
              <mat-icon matSuffix>lock_outline</mat-icon>
            </mat-form-field>
            
            <div *ngIf="passwordError" class="error-message">
              <mat-icon color="warn">error</mat-icon>
              <span>{{passwordError}}</span>
            </div>
            
            <div *ngIf="passwordSuccess" class="success-message">
              <mat-icon color="primary">check_circle</mat-icon>
              <span>{{passwordSuccess}}</span>
            </div>
          </div>
          
          <mat-divider></mat-divider>
          
          <div class="current-password-section">
            <h3>Senha Atual</h3>
            <div class="current-password-info">
              <mat-icon>vpn_key</mat-icon>
              <span>{{getCurrentPasswordDisplay()}}</span>
            </div>
            <p class="password-note">
              A senha atual está armazenada de forma segura e só pode ser alterada aqui.
            </p>
          </div>
        </mat-card-content>
        
        <mat-card-actions>
          <button mat-raised-button 
                  color="primary" 
                  [disabled]="!canSavePassword()"
                  (click)="savePassword()">
            <mat-icon>save</mat-icon>
            Salvar Senha
          </button>
          
          <button mat-stroked-button 
                  (click)="resetForm()">
            <mat-icon>refresh</mat-icon>
            Cancelar
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .security-settings {
      max-width: 600px;
    }
    
    .full-width {
      width: 100%;
      margin: 8px 0;
    }
    
    mat-card-header {
      margin-bottom: 16px;
    }
    
    mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    mat-card-title mat-icon {
      color: #1976d2;
    }
    
    .password-section {
      margin: 24px 0;
    }
    
    .info-text {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
      padding: 12px;
      background-color: #e3f2fd;
      border-radius: 4px;
      border-left: 4px solid #1976d2;
    }
    
    .info-text mat-icon {
      color: #1976d2;
    }
    
    .info-text p {
      margin: 0;
      color: #1565c0;
      font-size: 14px;
    }
    
    .error-message {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 8px;
      padding: 12px;
      background-color: #ffebee;
      border: 1px solid #f44336;
      border-radius: 4px;
      color: #c62828;
    }
    
    .success-message {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 8px;
      padding: 12px;
      background-color: #e8f5e8;
      border: 1px solid #4caf50;
      border-radius: 4px;
      color: #2e7d32;
    }
    
    .current-password-section {
      margin: 24px 0;
    }
    
    .current-password-section h3 {
      margin: 0 0 16px 0;
      color: rgba(0, 0, 0, 0.87);
    }
    
    .current-password-info {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 8px 0;
      padding: 12px;
      background-color: #f5f5f5;
      border-radius: 4px;
    }
    
    .current-password-info mat-icon {
      color: #666;
    }
    
    .current-password-info span {
      font-family: 'Courier New', monospace;
      font-size: 14px;
      color: #666;
    }
    
    .password-note {
      margin: 8px 0 0 0;
      font-size: 12px;
      color: rgba(0, 0, 0, 0.6);
    }
    
    mat-card-actions {
      justify-content: flex-end;
      gap: 8px;
    }
    
    mat-card-actions button mat-icon {
      margin-right: 4px;
    }
  `]
})
export class SecuritySettingsComponent {
  @Input() settings: SystemSettings | null = null;
  @Output() settingsChange = new EventEmitter<Partial<SystemSettings>>();

  newPassword: string = '';
  confirmPassword: string = '';
  passwordError: string = '';
  passwordSuccess: string = '';

  canSavePassword(): boolean {
    return this.newPassword.length >= 4 && 
           this.newPassword === this.confirmPassword && 
           this.newPassword.trim() !== '';
  }

  savePassword(): void {
    this.passwordError = '';
    this.passwordSuccess = '';

    if (!this.canSavePassword()) {
      if (this.newPassword.length < 4) {
        this.passwordError = 'A senha deve ter pelo menos 4 caracteres.';
      } else if (this.newPassword !== this.confirmPassword) {
        this.passwordError = 'As senhas não coincidem.';
      }
      return;
    }

    // Salvar senha no localStorage (em produção, isso seria enviado para o backend)
    localStorage.setItem('admin_cash_password', this.newPassword);
    
    this.passwordSuccess = 'Senha do caixa atualizada com sucesso!';
    
    // Limpar formulário após sucesso
    setTimeout(() => {
      this.resetForm();
    }, 2000);
  }

  resetForm(): void {
    this.newPassword = '';
    this.confirmPassword = '';
    this.passwordError = '';
    this.passwordSuccess = '';
  }

  getCurrentPasswordDisplay(): string {
    const currentPassword = localStorage.getItem('admin_cash_password') || 'admin123';
    return '•'.repeat(currentPassword.length) + ' (' + currentPassword.length + ' caracteres)';
  }
}

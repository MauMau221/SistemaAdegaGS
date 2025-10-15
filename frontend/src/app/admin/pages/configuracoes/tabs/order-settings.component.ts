import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';

import { SystemSettings } from '../../../services/settings.service';

@Component({
  selector: 'app-order-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatCheckboxModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatDividerModule
  ],
  template: `
    <div class="settings-section">
      <h2>Configurações de Pedidos</h2>

      <div class="settings-grid">
        <!-- Confirmação Automática -->
        <div class="setting-card">
          <div class="setting-header">
            <mat-icon>auto_awesome</mat-icon>
            <span>Confirmação Automática</span>
            <mat-slide-toggle
              [(ngModel)]="settings.auto_confirm_orders"
              (ngModelChange)="onFieldChange()">
            </mat-slide-toggle>
          </div>
          <p class="setting-description">
            Confirmar automaticamente novos pedidos quando o pagamento for aprovado
          </p>
        </div>

        <!-- Tempo de Cancelamento -->
        <div class="setting-card">
          <div class="setting-header">
            <mat-icon>timer</mat-icon>
            <span>Tempo de Cancelamento</span>
          </div>
          <mat-form-field appearance="outline">
            <mat-label>Minutos para Cancelamento</mat-label>
            <input matInput
                   type="number"
                   [(ngModel)]="settings.order_cancellation_time"
                   (ngModelChange)="onFieldChange()">
            <mat-hint>
              Tempo limite para o cliente cancelar o pedido após a confirmação
            </mat-hint>
          </mat-form-field>
        </div>
      </div>

      <mat-divider></mat-divider>

      <!-- Notificações -->
      <div class="notification-section">
        <h3>Notificações de Pedidos</h3>

        <div class="notification-toggle">
          <mat-slide-toggle
            [(ngModel)]="settings.enable_order_notifications"
            (ngModelChange)="onFieldChange()">
            Ativar Notificações
          </mat-slide-toggle>
        </div>

        <div class="channels-grid" *ngIf="settings.enable_order_notifications">
          <!-- E-mail -->
          <div class="channel-card">
            <mat-checkbox
              [(ngModel)]="settings.notification_channels.email"
              (ngModelChange)="onFieldChange()">
              <div class="channel-header">
                <mat-icon>email</mat-icon>
                <span>E-mail</span>
              </div>
            </mat-checkbox>
            <p class="channel-description">
              Enviar notificações por e-mail para clientes e funcionários
            </p>
          </div>

          <!-- SMS -->
          <div class="channel-card">
            <mat-checkbox
              [(ngModel)]="settings.notification_channels.sms"
              (ngModelChange)="onFieldChange()">
              <div class="channel-header">
                <mat-icon>sms</mat-icon>
                <span>SMS</span>
              </div>
            </mat-checkbox>
            <p class="channel-description">
              Enviar atualizações de status por SMS para clientes
            </p>
          </div>

          <!-- WhatsApp -->
          <div class="channel-card">
            <mat-checkbox
              [(ngModel)]="settings.notification_channels.whatsapp"
              (ngModelChange)="onFieldChange()">
              <div class="channel-header">
                <mat-icon>whatsapp</mat-icon>
                <span>WhatsApp</span>
              </div>
            </mat-checkbox>
            <p class="channel-description">
              Enviar mensagens automáticas via WhatsApp
            </p>
          </div>
        </div>
      </div>

      <div class="actions">
        <button mat-raised-button
                color="primary"
                [disabled]="!hasChanges"
                (click)="saveChanges()">
          Salvar Alterações
        </button>

        <button mat-stroked-button
                [disabled]="!hasChanges"
                (click)="resetChanges()">
          Cancelar
        </button>
      </div>
    </div>
  `,
  styles: [`
    .settings-section {
      padding: 20px 0;
    }

    h2, h3 {
      margin: 0 0 20px;
      font-size: 18px;
      color: #333;
    }

    h3 {
      font-size: 16px;
      margin-top: 24px;
    }

    .settings-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
    }

    .setting-card {
      background-color: #f5f5f5;
      border-radius: 8px;
      padding: 16px;
    }

    .setting-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 8px;
    }

    .setting-header mat-icon {
      color: #666;
    }

    .setting-header span {
      flex: 1;
      font-weight: 500;
    }

    .setting-description {
      margin: 8px 0 0;
      font-size: 14px;
      color: #666;
    }

    mat-divider {
      margin: 32px 0;
    }

    .notification-section {
      margin-bottom: 24px;
    }

    .notification-toggle {
      margin-bottom: 20px;
    }

    .channels-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
    }

    .channel-card {
      background-color: #f5f5f5;
      border-radius: 8px;
      padding: 16px;
    }

    .channel-header {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .channel-description {
      margin: 8px 0 0 32px;
      font-size: 14px;
      color: #666;
    }

    .actions {
      display: flex;
      gap: 16px;
      justify-content: flex-end;
      margin-top: 24px;
    }

    @media (max-width: 600px) {
      .settings-grid,
      .channels-grid {
        grid-template-columns: 1fr;
      }

      .actions {
        flex-direction: column;
      }

      .actions button {
        width: 100%;
      }
    }
  `]
})
export class OrderSettingsComponent {
  @Input() settings!: SystemSettings;
  @Output() settingsChange = new EventEmitter<Partial<SystemSettings>>();

  hasChanges = false;
  private originalSettings: Partial<SystemSettings> = {};

  ngOnInit(): void {
    this.originalSettings = { ...this.settings };
  }

  onFieldChange(): void {
    this.hasChanges = !this.isEqual(this.settings, this.originalSettings);
  }

  saveChanges(): void {
    const changes: Partial<SystemSettings> = this.getChanges();
    this.settingsChange.emit(changes);
    this.originalSettings = { ...this.settings };
    this.hasChanges = false;
  }

  resetChanges(): void {
    Object.assign(this.settings, this.originalSettings);
    this.hasChanges = false;
  }

  private isEqual(obj1: any, obj2: any): boolean {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  }

  private getChanges(): Partial<SystemSettings> {
    const changes: Partial<SystemSettings> = {};
    Object.keys(this.settings).forEach(key => {
      if (this.settings[key] !== this.originalSettings[key]) {
        changes[key] = this.settings[key];
      }
    });
    return changes;
  }
}

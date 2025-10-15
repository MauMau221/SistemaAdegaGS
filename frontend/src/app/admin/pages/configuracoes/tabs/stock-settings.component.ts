import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

import { SystemSettings } from '../../../services/settings.service';

@Component({
  selector: 'app-stock-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatChipsModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  template: `
    <div class="settings-section">
      <h2>Configurações de Estoque</h2>

      <div class="form-grid">
        <mat-form-field appearance="outline">
          <mat-label>Limite de Estoque Baixo</mat-label>
          <input matInput
                 type="number"
                 [(ngModel)]="settings.low_stock_threshold"
                 (ngModelChange)="onFieldChange()">
          <mat-hint>
            Quantidade mínima para alertas de estoque baixo
          </mat-hint>
        </mat-form-field>

        <div class="toggle-section">
          <mat-slide-toggle
            [(ngModel)]="settings.enable_stock_notifications"
            (ngModelChange)="onFieldChange()">
            Notificações de Estoque
          </mat-slide-toggle>
          <span class="toggle-hint">
            Receber alertas quando produtos atingirem o limite de estoque baixo
          </span>
        </div>
      </div>

      <!-- E-mails para Notificação -->
      <div class="notification-emails" *ngIf="settings.enable_stock_notifications">
        <h3>E-mails para Notificação</h3>
        
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>E-mails</mat-label>
          <mat-chip-grid #chipGrid>
            <mat-chip-row *ngFor="let email of settings.stock_notification_emails"
                         (removed)="removeEmail(email)">
              {{email}}
              <button matChipRemove>
                <mat-icon>cancel</mat-icon>
              </button>
            </mat-chip-row>
          </mat-chip-grid>
          <input placeholder="Adicionar e-mail..."
                 [matChipInputFor]="chipGrid"
                 [matChipInputSeparatorKeyCodes]="separatorKeysCodes"
                 (matChipInputTokenEnd)="addEmail($event)">
        </mat-form-field>

        <p class="helper-text">
          Pressione Enter ou use vírgula para adicionar múltiplos e-mails
        </p>
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

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
    }

    .toggle-section {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 8px 0;
    }

    .toggle-hint {
      font-size: 12px;
      color: #666;
    }

    .notification-emails {
      margin-top: 24px;
    }

    .full-width {
      width: 100%;
    }

    .helper-text {
      font-size: 12px;
      color: #666;
      margin: 4px 0 0;
    }

    .actions {
      display: flex;
      gap: 16px;
      justify-content: flex-end;
      margin-top: 24px;
    }

    @media (max-width: 600px) {
      .form-grid {
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
export class StockSettingsComponent {
  @Input() settings!: SystemSettings;
  @Output() settingsChange = new EventEmitter<Partial<SystemSettings>>();

  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  hasChanges = false;
  private originalSettings: Partial<SystemSettings> = {};

  ngOnInit(): void {
    this.originalSettings = { ...this.settings };
  }

  addEmail(event: any): void {
    const value = (event.value || '').trim();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (value && emailRegex.test(value)) {
      if (!this.settings.stock_notification_emails) {
        this.settings.stock_notification_emails = [];
      }
      this.settings.stock_notification_emails.push(value);
      this.onFieldChange();
    }

    event.chipInput?.clear();
  }

  removeEmail(email: string): void {
    const index = this.settings.stock_notification_emails.indexOf(email);
    if (index >= 0) {
      this.settings.stock_notification_emails.splice(index, 1);
      this.onFieldChange();
    }
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

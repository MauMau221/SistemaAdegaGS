import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';

import { SystemSettings } from '../../../services/settings.service';

@Component({
  selector: 'app-payment-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatDividerModule
  ],
  template: `
    <div class="settings-section">
      <h2>Métodos de Pagamento</h2>

      <div class="payment-methods">
        <!-- Cartão de Crédito -->
        <div class="payment-method-card">
          <div class="method-header">
            <mat-icon>credit_card</mat-icon>
            <span>Cartão de Crédito</span>
            <mat-slide-toggle
              [(ngModel)]="getPaymentMethod('credit_card').enabled"
              (ngModelChange)="onFieldChange()">
            </mat-slide-toggle>
          </div>

          <div class="method-content" *ngIf="getPaymentMethod('credit_card').enabled">
            <mat-form-field appearance="outline">
              <mat-label>Taxa Adicional (%)</mat-label>
              <input matInput
                     type="number"
                     [(ngModel)]="getPaymentMethod('credit_card').additional_fee"
                     (ngModelChange)="onFieldChange()">
            </mat-form-field>
          </div>
        </div>

        <!-- Cartão de Débito -->
        <div class="payment-method-card">
          <div class="method-header">
            <mat-icon>payment</mat-icon>
            <span>Cartão de Débito</span>
            <mat-slide-toggle
              [(ngModel)]="getPaymentMethod('debit_card').enabled"
              (ngModelChange)="onFieldChange()">
            </mat-slide-toggle>
          </div>

          <div class="method-content" *ngIf="getPaymentMethod('debit_card').enabled">
            <mat-form-field appearance="outline">
              <mat-label>Taxa Adicional (%)</mat-label>
              <input matInput
                     type="number"
                     [(ngModel)]="getPaymentMethod('debit_card').additional_fee"
                     (ngModelChange)="onFieldChange()">
            </mat-form-field>
          </div>
        </div>

        <!-- Dinheiro -->
        <div class="payment-method-card">
          <div class="method-header">
            <mat-icon>local_atm</mat-icon>
            <span>Dinheiro</span>
            <mat-slide-toggle
              [(ngModel)]="getPaymentMethod('cash').enabled"
              (ngModelChange)="onFieldChange()">
            </mat-slide-toggle>
          </div>
        </div>

        <!-- PIX -->
        <div class="payment-method-card">
          <div class="method-header">
            <mat-icon>qr_code</mat-icon>
            <span>PIX</span>
            <mat-slide-toggle
              [(ngModel)]="getPaymentMethod('pix').enabled"
              (ngModelChange)="onFieldChange()">
            </mat-slide-toggle>
          </div>

          <div class="method-content" *ngIf="getPaymentMethod('pix').enabled">
            <mat-form-field appearance="outline">
              <mat-label>Chave PIX</mat-label>
              <input matInput
                     [(ngModel)]="settings.pix_key"
                     (ngModelChange)="onFieldChange()">
              <mat-icon matSuffix
                       matTooltip="Chave PIX principal para recebimento">
                info
              </mat-icon>
            </mat-form-field>

            <!-- QR Code -->
            <div class="qr-code-section" *ngIf="settings.pix_qr_code">
              <img [src]="settings.pix_qr_code" 
                   alt="QR Code PIX"
                   class="qr-code-preview">
              <button mat-stroked-button
                      color="warn"
                      (click)="removeQrCode()">
                <mat-icon>delete</mat-icon>
                Remover QR Code
              </button>
            </div>

            <div class="qr-code-upload" *ngIf="!settings.pix_qr_code">
              <button mat-stroked-button
                      color="primary"
                      (click)="qrCodeInput.click()">
                <mat-icon>upload</mat-icon>
                Upload QR Code
              </button>
              <input #qrCodeInput
                     type="file"
                     accept="image/*"
                     (change)="onQrCodeSelected($event)"
                     style="display: none">
            </div>
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

    h2 {
      margin: 0 0 20px;
      font-size: 18px;
      color: #333;
    }

    .payment-methods {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
    }

    .payment-method-card {
      background-color: #f5f5f5;
      border-radius: 8px;
      padding: 16px;
    }

    .method-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 16px;
    }

    .method-header mat-icon {
      color: #666;
    }

    .method-header span {
      flex: 1;
      font-weight: 500;
    }

    .method-content {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .qr-code-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }

    .qr-code-preview {
      max-width: 200px;
      border-radius: 8px;
      border: 1px solid #ddd;
    }

    .qr-code-upload {
      display: flex;
      justify-content: center;
      padding: 16px;
      border: 2px dashed #ccc;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .qr-code-upload:hover {
      border-color: #666;
      background-color: rgba(0, 0, 0, 0.02);
    }

    .actions {
      display: flex;
      gap: 16px;
      justify-content: flex-end;
      margin-top: 24px;
    }

    @media (max-width: 600px) {
      .payment-methods {
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
export class PaymentSettingsComponent {
  @Input() settings!: SystemSettings;
  @Output() settingsChange = new EventEmitter<Partial<SystemSettings>>();

  hasChanges = false;
  private originalSettings: Partial<SystemSettings> = {};

  ngOnInit(): void {
    this.originalSettings = { ...this.settings };
  }

  getPaymentMethod(method: 'credit_card' | 'debit_card' | 'cash' | 'pix') {
    return this.settings.accepted_payment_methods.find(m => m.method === method) || {
      method,
      enabled: false
    };
  }

  onQrCodeSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.settings.pix_qr_code = reader.result as string;
        this.onFieldChange();
      };
      reader.readAsDataURL(file);
    }
  }

  removeQrCode(): void {
    if (confirm('Tem certeza que deseja remover o QR Code?')) {
      this.settings.pix_qr_code = undefined;
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

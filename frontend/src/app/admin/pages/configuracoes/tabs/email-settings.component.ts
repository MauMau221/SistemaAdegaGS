import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { SystemSettings, SettingsService } from '../../../services/settings.service';

@Component({
  selector: 'app-email-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="settings-section">
      <h2>Configurações de E-mail</h2>

      <!-- Configurações Básicas -->
      <div class="form-grid">
        <mat-form-field appearance="outline">
          <mat-label>Nome do Remetente</mat-label>
          <input matInput
                 [(ngModel)]="settings.email_sender_name"
                 (ngModelChange)="onFieldChange()">
          <mat-hint>
            Nome que aparecerá como remetente dos e-mails
          </mat-hint>
        </mat-form-field>

        <!-- Teste de E-mail -->
        <div class="test-email">
          <mat-form-field appearance="outline">
            <mat-label>E-mail para Teste</mat-label>
            <input matInput
                   type="email"
                   [(ngModel)]="testEmail"
                   [disabled]="testing">
          </mat-form-field>

          <button mat-raised-button
                  color="primary"
                  [disabled]="!testEmail || testing"
                  (click)="testEmailSettings()">
            <mat-icon>send</mat-icon>
            {{testing ? 'Enviando...' : 'Enviar Teste'}}
          </button>
        </div>
      </div>

      <!-- Templates de E-mail -->
      <div class="templates-section">
        <h3>Templates de E-mail</h3>

        <mat-tab-group>
          <!-- Boas-vindas -->
          <mat-tab label="Boas-vindas">
            <div class="template-editor">
              <mat-form-field appearance="outline">
                <mat-label>Template de Boas-vindas</mat-label>
                <textarea matInput
                          [(ngModel)]="settings.email_templates.welcome"
                          (ngModelChange)="onFieldChange()"
                          rows="10">
                </textarea>
              </mat-form-field>

              <div class="template-variables">
                <h4>Variáveis Disponíveis:</h4>
                <ul>
                  <li><code>{{ '{' }}name{{ '}' }}</code> - Nome do usuário</li>
                  <li><code>{{ '{' }}email{{ '}' }}</code> - E-mail do usuário</li>
                  <li><code>{{ '{' }}verification_link{{ '}' }}</code> - Link de verificação</li>
                </ul>
              </div>
            </div>
          </mat-tab>

          <!-- Confirmação de Pedido -->
          <mat-tab label="Confirmação de Pedido">
            <div class="template-editor">
              <mat-form-field appearance="outline">
                <mat-label>Template de Confirmação</mat-label>
                <textarea matInput
                          [(ngModel)]="settings.email_templates.order_confirmation"
                          (ngModelChange)="onFieldChange()"
                          rows="10">
                </textarea>
              </mat-form-field>

              <div class="template-variables">
                <h4>Variáveis Disponíveis:</h4>
                <ul>
                  <li><code>{{ '{' }}order_number{{ '}' }}</code> - Número do pedido</li>
                  <li><code>{{ '{' }}customer_name{{ '}' }}</code> - Nome do cliente</li>
                  <li><code>{{ '{' }}order_total{{ '}' }}</code> - Valor total</li>
                  <li><code>{{ '{' }}order_items{{ '}' }}</code> - Lista de itens</li>
                  <li><code>{{ '{' }}delivery_address{{ '}' }}</code> - Endereço de entrega</li>
                  <li><code>{{ '{' }}payment_method{{ '}' }}</code> - Forma de pagamento</li>
                </ul>
              </div>
            </div>
          </mat-tab>

          <!-- Status do Pedido -->
          <mat-tab label="Status do Pedido">
            <div class="template-editor">
              <mat-form-field appearance="outline">
                <mat-label>Template de Status</mat-label>
                <textarea matInput
                          [(ngModel)]="settings.email_templates.order_status"
                          (ngModelChange)="onFieldChange()"
                          rows="10">
                </textarea>
              </mat-form-field>

              <div class="template-variables">
                <h4>Variáveis Disponíveis:</h4>
                <ul>
                  <li><code>{{ '{' }}order_number{{ '}' }}</code> - Número do pedido</li>
                  <li><code>{{ '{' }}customer_name{{ '}' }}</code> - Nome do cliente</li>
                  <li><code>{{ '{' }}order_status{{ '}' }}</code> - Status atual</li>
                  <li><code>{{ '{' }}status_description{{ '}' }}</code> - Descrição do status</li>
                  <li><code>{{ '{' }}estimated_delivery{{ '}' }}</code> - Previsão de entrega</li>
                </ul>
              </div>
            </div>
          </mat-tab>

          <!-- Redefinição de Senha -->
          <mat-tab label="Redefinição de Senha">
            <div class="template-editor">
              <mat-form-field appearance="outline">
                <mat-label>Template de Redefinição</mat-label>
                <textarea matInput
                          [(ngModel)]="settings.email_templates.password_reset"
                          (ngModelChange)="onFieldChange()"
                          rows="10">
                </textarea>
              </mat-form-field>

              <div class="template-variables">
                <h4>Variáveis Disponíveis:</h4>
                <ul>
                  <li><code>{{ '{' }}name{{ '}' }}</code> - Nome do usuário</li>
                  <li><code>{{ '{' }}reset_link{{ '}' }}</code> - Link de redefinição</li>
                  <li><code>{{ '{' }}expiry_time{{ '}' }}</code> - Tempo de expiração</li>
                </ul>
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>
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

    h2, h3, h4 {
      margin: 0 0 20px;
      color: #333;
    }

    h2 {
      font-size: 18px;
    }

    h3 {
      font-size: 16px;
      margin-top: 32px;
    }

    h4 {
      font-size: 14px;
      margin-bottom: 12px;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
    }

    .test-email {
      display: flex;
      gap: 16px;
      align-items: flex-start;
    }

    .test-email mat-form-field {
      flex: 1;
    }

    .test-email button {
      margin-top: 4px;
    }

    .templates-section {
      margin-top: 32px;
    }

    .template-editor {
      padding: 20px 0;
    }

    mat-form-field {
      width: 100%;
    }

    .template-variables {
      margin-top: 16px;
      padding: 16px;
      background-color: #f5f5f5;
      border-radius: 8px;
    }

    .template-variables ul {
      margin: 0;
      padding-left: 20px;
    }

    .template-variables li {
      margin: 8px 0;
      color: #666;
    }

    code {
      background-color: #e0e0e0;
      padding: 2px 4px;
      border-radius: 4px;
      font-family: monospace;
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

      .test-email {
        flex-direction: column;
      }

      .test-email button {
        width: 100%;
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
export class EmailSettingsComponent {
  @Input() settings!: SystemSettings;
  @Output() settingsChange = new EventEmitter<Partial<SystemSettings>>();

  testEmail = '';
  testing = false;
  hasChanges = false;
  private originalSettings: Partial<SystemSettings> = {};

  constructor(
    private settingsService: SettingsService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.originalSettings = { ...this.settings };
    this.ensureEmailTemplates();
  }

  testEmailSettings(): void {
    if (!this.testEmail) return;

    this.testing = true;
    this.settingsService.testEmailSettings(this.testEmail).subscribe({
      next: (response) => {
        this.snackBar.open(
          response.success ? 'E-mail de teste enviado com sucesso!' : response.message,
          'Fechar',
          { duration: 3000 }
        );
        this.testing = false;
      },
      error: (error) => {
        console.error('Erro ao testar configurações de e-mail:', error);
        this.snackBar.open('Erro ao enviar e-mail de teste', 'Fechar', { duration: 3000 });
        this.testing = false;
      }
    });
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

  private ensureEmailTemplates(): void {
    if (!this.settings.email_templates) {
      this.settings.email_templates = {
        welcome: '',
        order_confirmation: '',
        order_status: '',
        password_reset: ''
      } as any;
    } else {
      this.settings.email_templates.welcome = this.settings.email_templates.welcome || '';
      this.settings.email_templates.order_confirmation = this.settings.email_templates.order_confirmation || '';
      this.settings.email_templates.order_status = this.settings.email_templates.order_status || '';
      this.settings.email_templates.password_reset = this.settings.email_templates.password_reset || '';
    }
  }
}

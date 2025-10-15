import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { SystemSettings } from '../../../services/settings.service';

@Component({
  selector: 'app-business-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatSnackBarModule
  ],
  template: `
    <div class="settings-section">
      <h2>Horário de Funcionamento</h2>
      
      <div class="business-hours">
        <div class="day-row" *ngFor="let day of settings.business_hours; let i = index">
          <div class="day-name">
            {{getDayName(i)}}
          </div>

          <mat-slide-toggle
            [(ngModel)]="day.is_closed"
            (ngModelChange)="onFieldChange()">
            {{day.is_closed ? 'Fechado' : 'Aberto'}}
          </mat-slide-toggle>

          <div class="hours-inputs" *ngIf="!day.is_closed">
            <mat-form-field appearance="outline">
              <mat-label>Abertura</mat-label>
              <input matInput
                     type="time"
                     [(ngModel)]="day.open"
                     (ngModelChange)="onFieldChange()">
            </mat-form-field>

            <span class="separator">até</span>

            <mat-form-field appearance="outline">
              <mat-label>Fechamento</mat-label>
              <input matInput
                     type="time"
                     [(ngModel)]="day.close"
                     (ngModelChange)="onFieldChange()">
            </mat-form-field>
          </div>
        </div>
      </div>

      <h2>Entrega</h2>
      <div class="form-grid">
        <mat-form-field appearance="outline">
          <mat-label>Taxa de Entrega (R$)</mat-label>
          <input matInput
                 type="number"
                 [(ngModel)]="settings.delivery_fee"
                 (ngModelChange)="onFieldChange()">
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Valor Mínimo do Pedido (R$)</mat-label>
          <input matInput
                 type="number"
                 [(ngModel)]="settings.min_order_value"
                 (ngModelChange)="onFieldChange()">
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Raio Máximo de Entrega (km)</mat-label>
          <input matInput
                 type="number"
                 [(ngModel)]="settings.max_delivery_radius"
                 (ngModelChange)="onFieldChange()">
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Tempo Estimado de Entrega (min)</mat-label>
          <input matInput
                 type="number"
                 [(ngModel)]="settings.delivery_estimate_time"
                 (ngModelChange)="onFieldChange()">
        </mat-form-field>
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

    .business-hours {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-bottom: 24px;
    }

    .day-row {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 8px;
      background-color: #f5f5f5;
      border-radius: 8px;
    }

    .day-name {
      width: 100px;
      font-weight: 500;
    }

    .hours-inputs {
      display: flex;
      align-items: center;
      gap: 16px;
      flex: 1;
    }

    .separator {
      color: #666;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .actions {
      display: flex;
      gap: 16px;
      justify-content: flex-end;
      margin-top: 24px;
    }

    @media (max-width: 600px) {
      .day-row {
        flex-direction: column;
        align-items: stretch;
      }

      .hours-inputs {
        flex-direction: column;
      }

      .separator {
        text-align: center;
        margin: 8px 0;
      }

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
export class BusinessSettingsComponent {
  @Input() settings!: SystemSettings;
  @Output() settingsChange = new EventEmitter<Partial<SystemSettings>>();

  hasChanges = false;
  private originalSettings: Partial<SystemSettings> = {};

  ngOnInit(): void {
    this.originalSettings = { ...this.settings };
  }

  getDayName(index: number): string {
    const days = [
      'Domingo',
      'Segunda-feira',
      'Terça-feira',
      'Quarta-feira',
      'Quinta-feira',
      'Sexta-feira',
      'Sábado'
    ];
    return days[index];
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

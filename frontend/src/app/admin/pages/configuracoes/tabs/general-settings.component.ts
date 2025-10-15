import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { SystemSettings, SettingsService } from '../../../services/settings.service';

@Component({
  selector: 'app-general-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressBarModule
  ],
  template: `
    <div class="settings-section">
      <h2>Informações do Site</h2>

      <!-- Logo -->
      <div class="logo-section">
        <div class="current-logo" 
             [class.has-logo]="settings.logo_url"
             (click)="logoInput.click()">
          <img *ngIf="settings.logo_url" [src]="settings.logo_url" alt="Logo">
          <mat-icon *ngIf="!settings.logo_url">image</mat-icon>
          <div class="overlay">
            <mat-icon>edit</mat-icon>
          </div>
        </div>
        <input #logoInput 
               type="file" 
               accept="image/*" 
               (change)="onLogoSelected($event)"
               style="display: none">
        
        <div class="logo-actions" *ngIf="settings.logo_url">
          <button mat-icon-button 
                  color="warn" 
                  (click)="removeLogo()"
                  matTooltip="Remover Logo">
            <mat-icon>delete</mat-icon>
          </button>
        </div>

        <mat-progress-bar *ngIf="uploading"
                         mode="indeterminate">
        </mat-progress-bar>
      </div>

      <!-- Favicon -->
      <div class="favicon-section">
        <div class="current-favicon"
             [class.has-favicon]="settings.favicon_url"
             (click)="faviconInput.click()">
          <img *ngIf="settings.favicon_url" [src]="settings.favicon_url" alt="Favicon">
          <mat-icon *ngIf="!settings.favicon_url">favicon</mat-icon>
          <div class="overlay">
            <mat-icon>edit</mat-icon>
          </div>
        </div>
        <input #faviconInput 
               type="file" 
               accept="image/x-icon,image/png" 
               (change)="onFaviconSelected($event)"
               style="display: none">
        
        <div class="favicon-actions" *ngIf="settings.favicon_url">
          <button mat-icon-button 
                  color="warn" 
                  (click)="removeFavicon()"
                  matTooltip="Remover Favicon">
            <mat-icon>delete</mat-icon>
          </button>
        </div>

        <mat-progress-bar *ngIf="uploadingFavicon"
                         mode="indeterminate">
        </mat-progress-bar>
      </div>

      <!-- Informações Básicas -->
      <div class="form-grid">
        <mat-form-field appearance="outline">
          <mat-label>Nome do Site</mat-label>
          <input matInput 
                 [(ngModel)]="settings.site_name"
                 (ngModelChange)="onFieldChange()">
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Descrição</mat-label>
          <textarea matInput 
                    [(ngModel)]="settings.site_description"
                    (ngModelChange)="onFieldChange()"
                    rows="3">
          </textarea>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>E-mail de Contato</mat-label>
          <input matInput 
                 type="email"
                 [(ngModel)]="settings.contact_email"
                 (ngModelChange)="onFieldChange()">
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Telefone de Contato</mat-label>
          <input matInput 
                 [(ngModel)]="settings.contact_phone"
                 (ngModelChange)="onFieldChange()">
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Endereço</mat-label>
          <textarea matInput 
                    [(ngModel)]="settings.address"
                    (ngModelChange)="onFieldChange()"
                    rows="3">
          </textarea>
        </mat-form-field>
      </div>

      <h2>SEO</h2>
      <div class="form-grid">
        <mat-form-field appearance="outline">
          <mat-label>Meta Keywords</mat-label>
          <textarea matInput 
                    [(ngModel)]="settings.meta_keywords"
                    (ngModelChange)="onFieldChange()"
                    rows="3"
                    placeholder="Palavras-chave separadas por vírgula">
          </textarea>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Meta Description</mat-label>
          <textarea matInput 
                    [(ngModel)]="settings.meta_description"
                    (ngModelChange)="onFieldChange()"
                    rows="3">
          </textarea>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>ID do Google Analytics</mat-label>
          <input matInput 
                 [(ngModel)]="settings.google_analytics_id"
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

    .logo-section,
    .favicon-section {
      margin-bottom: 24px;
    }

    .current-logo,
    .current-favicon {
      width: 150px;
      height: 150px;
      border: 2px dashed #ccc;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      position: relative;
      overflow: hidden;
    }

    .current-favicon {
      width: 64px;
      height: 64px;
    }

    .current-logo.has-logo,
    .current-favicon.has-favicon {
      border-style: solid;
    }

    .current-logo img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }

    .current-favicon img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .current-logo mat-icon,
    .current-favicon mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #ccc;
    }

    .current-favicon mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.2s;
    }

    .current-logo:hover .overlay,
    .current-favicon:hover .overlay {
      opacity: 1;
    }

    .overlay mat-icon {
      color: white;
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .logo-actions,
    .favicon-actions {
      margin-top: 8px;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .actions {
      display: flex;
      gap: 16px;
      justify-content: flex-end;
      margin-top: 24px;
    }

    mat-progress-bar {
      margin-top: 8px;
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
export class GeneralSettingsComponent {
  @Input() settings!: SystemSettings;
  @Output() settingsChange = new EventEmitter<Partial<SystemSettings>>();

  uploading = false;
  uploadingFavicon = false;
  hasChanges = false;
  private originalSettings: Partial<SystemSettings> = {};

  constructor(
    private settingsService: SettingsService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.originalSettings = { ...this.settings };
  }

  onLogoSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.uploading = true;
      this.settingsService.uploadLogo(file).subscribe({
        next: (response) => {
          this.settings.logo_url = response.logo_url;
          this.settingsChange.emit({ logo_url: response.logo_url });
          this.uploading = false;
        },
        error: (error) => {
          console.error('Erro ao fazer upload do logo:', error);
          this.snackBar.open('Erro ao fazer upload do logo', 'Fechar', { duration: 3000 });
          this.uploading = false;
        }
      });
    }
  }

  onFaviconSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.uploadingFavicon = true;
      this.settingsService.uploadFavicon(file).subscribe({
        next: (response) => {
          this.settings.favicon_url = response.favicon_url;
          this.settingsChange.emit({ favicon_url: response.favicon_url });
          this.uploadingFavicon = false;
        },
        error: (error) => {
          console.error('Erro ao fazer upload do favicon:', error);
          this.snackBar.open('Erro ao fazer upload do favicon', 'Fechar', { duration: 3000 });
          this.uploadingFavicon = false;
        }
      });
    }
  }

  removeLogo(): void {
    if (confirm('Tem certeza que deseja remover o logo?')) {
      this.settings.logo_url = undefined;
      this.settingsChange.emit({ logo_url: undefined });
    }
  }

  removeFavicon(): void {
    if (confirm('Tem certeza que deseja remover o favicon?')) {
      this.settings.favicon_url = undefined;
      this.settingsChange.emit({ favicon_url: undefined });
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

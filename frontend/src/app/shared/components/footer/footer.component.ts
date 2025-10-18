import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PublicSettingsService, PublicSettings } from '../../../core/services/public-settings.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class FooterComponent implements OnInit, OnDestroy {
  currentYear = new Date().getFullYear();
  settings: PublicSettings | null = null;
  private settingsSubscription?: Subscription;
  
  private publicSettingsService = inject(PublicSettingsService);

  ngOnInit(): void {
    // Carregar configurações iniciais
    this.publicSettingsService.getSettings().subscribe({
      next: (settings) => {
        this.settings = settings;
      },
      error: (error) => {
        console.error('Erro ao carregar configurações:', error);
      }
    });

    // Observar mudanças nas configurações
    this.settingsSubscription = this.publicSettingsService.watchSettings().subscribe(settings => {
      this.settings = settings;
    });
  }

  ngOnDestroy(): void {
    if (this.settingsSubscription) {
      this.settingsSubscription.unsubscribe();
    }
  }

  getWhatsAppUrl(phone: string | undefined): string {
    if (!phone) return '';
    const cleanPhone = phone.replace(/\D/g, '');
    return `https://wa.me/${cleanPhone}`;
  }
}
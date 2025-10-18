import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { PublicSettingsService, PublicSettings } from './core/services/public-settings.service';
import { TitleService } from './core/services/title.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet
  ],
  template: '<router-outlet></router-outlet>'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Adega GS';
  private settingsSubscription?: Subscription;
  
  private publicSettingsService = inject(PublicSettingsService);
  private titleService = inject(TitleService);

  ngOnInit(): void {
    // Carregar configurações e atualizar título
    this.publicSettingsService.getSettings().subscribe({
      next: (settings) => {
        if (settings?.site_name) {
          this.titleService.setTitle(settings.site_name);
        }
        if (settings?.favicon_url) {
          this.updateFavicon(settings.favicon_url);
        }
      },
      error: (error) => {
        console.error('Erro ao carregar configurações:', error);
      }
    });

    // Observar mudanças nas configurações
    this.settingsSubscription = this.publicSettingsService.watchSettings().subscribe(settings => {
      if (settings?.site_name) {
        this.titleService.setTitle(settings.site_name);
      }
      if (settings?.favicon_url) {
        this.updateFavicon(settings.favicon_url);
      }
    });
  }

  private updateFavicon(faviconUrl: string): void {
    const faviconUrlComplete = this.publicSettingsService.getFaviconUrl(faviconUrl);
    
    // Remover favicon existente
    const existingFavicon = document.querySelector('link[rel="icon"]');
    if (existingFavicon) {
      existingFavicon.remove();
    }

    // Adicionar novo favicon
    const link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/x-icon';
    link.href = faviconUrlComplete;
    document.head.appendChild(link);
  }

  ngOnDestroy(): void {
    if (this.settingsSubscription) {
      this.settingsSubscription.unsubscribe();
    }
  }
}
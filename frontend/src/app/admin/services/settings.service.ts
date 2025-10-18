import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface SystemSettings {
  [key: string]: any; // Allow string indexing
  // Configurações Gerais
  site_name: string;
  site_description: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  logo_url?: string;
  favicon_url?: string;

  // Configurações de Negócio
  business_hours: {
    day: number; // 0-6 (Domingo-Sábado)
    open: string; // HH:mm
    close: string; // HH:mm
    is_closed: boolean;
  }[];
  delivery_fee: number;
  min_order_value: number;
  max_delivery_radius: number;
  delivery_estimate_time: number;

  // Configurações de Pagamento
  accepted_payment_methods: {
    method: 'credit_card' | 'debit_card' | 'cash' | 'pix';
    enabled: boolean;
    additional_fee?: number;
  }[];
  pix_key?: string;
  pix_qr_code?: string;

  // Configurações de Estoque
  low_stock_threshold: number;
  enable_stock_notifications: boolean;
  stock_notification_emails: string[];

  // Configurações de Pedidos
  auto_confirm_orders: boolean;
  order_cancellation_time: number; // minutos
  enable_order_notifications: boolean;
  notification_channels: {
    email: boolean;
    sms: boolean;
    whatsapp: boolean;
  };

  // Configurações de Email
  email_sender_name: string;
  email_templates: {
    welcome: string;
    order_confirmation: string;
    order_status: string;
    password_reset: string;
  };

  // Configurações de Backup
  auto_backup_enabled: boolean;
  backup_frequency: 'daily' | 'weekly' | 'monthly';
  backup_retention_days: number;
  backup_storage_path: string;

  // Configurações de Cache
  cache_enabled: boolean;
  cache_ttl: number; // segundos
  cache_prefix: string;

  // Configurações de Segurança
  max_login_attempts: number;
  lockout_duration: number; // minutos
  password_expiry_days: number;
  require_2fa_for_admin: boolean;
  allowed_ips?: string[];

  // Configurações de SEO
  meta_keywords: string;
  meta_description: string;
  google_analytics_id?: string;
  enable_sitemap: boolean;

  // Configurações de Integração
  enable_whatsapp_integration: boolean;
  whatsapp_number?: string;
  whatsapp_message_template?: string;
  enable_telegram_integration: boolean;
  telegram_bot_token?: string;
  telegram_chat_id?: string;
}

export interface BackupInfo {
  id: number;
  filename: string;
  size: number;
  created_at: string;
  status: 'success' | 'failed';
  download_url?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private apiUrl = `${environment.apiUrl}/admin/settings`;
  private settings = new BehaviorSubject<SystemSettings | null>(null);

  constructor(private http: HttpClient) {}

  getSettings(): Observable<SystemSettings> {
    return this.http.get<SystemSettings>(this.apiUrl).pipe(
      tap(settings => this.settings.next(settings))
    );
  }

  updateSettings(settings: Partial<SystemSettings>): Observable<SystemSettings> {
    console.log('Sending settings to API:', settings);
    console.log('API URL:', this.apiUrl);
    
    return this.http.put<SystemSettings>(this.apiUrl, settings).pipe(
      tap(updatedSettings => {
        console.log('Settings updated in service:', updatedSettings);
        this.settings.next(updatedSettings);
      })
    );
  }

  uploadLogo(file: File): Observable<{ logo_url: string }> {
    const formData = new FormData();
    formData.append('logo', file);
    return this.http.post<{ logo_url: string }>(`${this.apiUrl}/logo`, formData);
  }

  uploadFavicon(file: File): Observable<{ favicon_url: string }> {
    const formData = new FormData();
    formData.append('favicon', file);
    return this.http.post<{ favicon_url: string }>(`${this.apiUrl}/favicon`, formData);
  }

  testEmailSettings(email: string): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.apiUrl}/test-email`,
      { email }
    );
  }

  getBackups(): Observable<BackupInfo[]> {
    return this.http.get<BackupInfo[]>(`${this.apiUrl}/backups`);
  }

  createBackup(): Observable<BackupInfo> {
    return this.http.post<BackupInfo>(`${this.apiUrl}/backups`, {});
  }

  restoreBackup(backupId: number): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.apiUrl}/backups/${backupId}/restore`,
      {}
    );
  }

  deleteBackup(backupId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/backups/${backupId}`);
  }

  clearCache(): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.apiUrl}/clear-cache`,
      {}
    );
  }

  generateSitemap(): Observable<{ success: boolean; url: string }> {
    return this.http.post<{ success: boolean; url: string }>(
      `${this.apiUrl}/generate-sitemap`,
      {}
    );
  }

  validateIpAddress(ip: string): Observable<{ valid: boolean; message: string }> {
    return this.http.post<{ valid: boolean; message: string }>(
      `${this.apiUrl}/validate-ip`,
      { ip }
    );
  }

  testWhatsApp(): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.apiUrl}/test-whatsapp`,
      {}
    );
  }

  testTelegram(): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.apiUrl}/test-telegram`,
      {}
    );
  }

  getCurrentSettings(): SystemSettings | null {
    return this.settings.value;
  }

  watchSettings(): Observable<SystemSettings | null> {
    return this.settings.asObservable();
  }
}

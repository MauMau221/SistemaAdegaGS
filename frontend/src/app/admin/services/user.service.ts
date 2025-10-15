import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UserResponse {
  data: User[];
  total: number;
  current_page: number;
  per_page: number;
  last_page: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  type: 'admin' | 'employee' | 'customer';
  phone?: string;
  address?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipcode: string;
  };
  avatar_url?: string;
  is_active: boolean;
  email_verified_at?: string;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  type: 'admin' | 'employee' | 'customer';
  phone?: string;
  address?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipcode: string;
  };
  avatar?: File;
  is_active: boolean;
}

export interface UpdateUserDTO extends Partial<Omit<CreateUserDTO, 'password_confirmation'>> {
  id: number;
}

export interface UserStats {
  total_orders: number;
  total_spent: number;
  average_order_value: number;
  last_order_date?: string;
  favorite_products: {
    product_id: number;
    product_name: string;
    quantity: number;
    total_spent: number;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/admin/users`;

  constructor(private http: HttpClient) {}

  getUsers(params: {
    page?: number;
    per_page?: number;
    search?: string;
    type?: 'admin' | 'employee' | 'customer';
    is_active?: boolean;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  } = {}): Observable<UserResponse> {
    let httpParams = new HttpParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        httpParams = httpParams.set(key, value.toString());
      }
    });

    return this.http.get<UserResponse>(this.apiUrl, { params: httpParams });
  }

  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  createUser(user: CreateUserDTO): Observable<User> {
    const formData = new FormData();
    
    Object.entries(user).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'avatar' && value instanceof File) {
          formData.append('avatar', value, value.name);
        } else if (key === 'address' && typeof value === 'object') {
          formData.append('address', JSON.stringify(value));
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    return this.http.post<User>(this.apiUrl, formData);
  }

  updateUser(user: UpdateUserDTO): Observable<User> {
    const formData = new FormData();
    
    Object.entries(user).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'avatar' && value instanceof File) {
          formData.append('avatar', value, value.name);
        } else if (key === 'address' && typeof value === 'object') {
          formData.append('address', JSON.stringify(value));
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    formData.append('_method', 'PUT');
    return this.http.post<User>(`${this.apiUrl}/${user.id}`, formData);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  toggleStatus(id: number): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${id}/toggle-status`, {});
  }

  uploadAvatar(id: number, avatar: File): Observable<User> {
    const formData = new FormData();
    formData.append('avatar', avatar, avatar.name);
    return this.http.post<User>(`${this.apiUrl}/${id}/avatar`, formData);
  }

  deleteAvatar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/avatar`);
  }

  resetPassword(id: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/${id}/reset-password`, {});
  }

  validateEmail(email: string, excludeId?: number): Observable<{ valid: boolean }> {
    let params = new HttpParams().set('email', email);
    if (excludeId) {
      params = params.set('exclude_id', excludeId.toString());
    }
    return this.http.get<{ valid: boolean }>(`${this.apiUrl}/validate-email`, { params });
  }

  getUserStats(id: number): Observable<UserStats> {
    return this.http.get<UserStats>(`${this.apiUrl}/${id}/stats`);
  }

  exportUsers(format: 'csv' | 'xlsx' = 'xlsx'): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export`, {
      params: { format },
      responseType: 'blob'
    });
  }

  importUsers(file: File): Observable<{ imported: number; errors: string[] }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ imported: number; errors: string[] }>(`${this.apiUrl}/import`, formData);
  }

  sendWelcomeEmail(id: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/${id}/send-welcome`, {});
  }

  updateStatus(id: number, isActive: boolean): Observable<User> {
    return this.http.patch<User>(
      `${this.apiUrl}/${id}/status`,
      { is_active: isActive }
    );
  }

  resendVerificationEmail(id: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/${id}/resend-verification`, {});
  }
}

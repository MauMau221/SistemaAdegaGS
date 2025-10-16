import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CategoryResponse {
  data: Category[];
  total: number;
  current_page: number;
  per_page: number;
  last_page: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parent_id?: number;
  image_url?: string;
  is_active: boolean;
  products_count: number;
  created_at: string;
  updated_at: string;
  parent?: Category;
  children?: Category[];
}

export interface CreateCategoryDTO {
  name: string;
  description?: string;
  parent_id?: number;
  image?: File;
  is_active: boolean;
}

export interface UpdateCategoryDTO extends Partial<CreateCategoryDTO> {
  id: number;
}

export interface CategoryTree {
  id: number;
  name: string;
  level: number;
  expandable: boolean;
  children?: CategoryTree[];
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = `${environment.apiUrl}/admin/categories`;

  constructor(private http: HttpClient) {}

  getCategories(params: {
    page?: number;
    per_page?: number;
    search?: string;
    parent_id?: number;
    is_active?: boolean;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  } = {}): Observable<CategoryResponse> {
    let httpParams = new HttpParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        httpParams = httpParams.set(key, value.toString());
      }
    });

    return this.http.get<CategoryResponse>(this.apiUrl, { params: httpParams });
  }

  getAllCategories(): Observable<Category[]> {
    const params = new HttpParams().set('per_page', '1000');
    return this.http.get<CategoryResponse>(this.apiUrl, { params }).pipe(
      map(response => response.data)
    );
  }

  getCategoryTree(): Observable<CategoryTree[]> {
    return this.http.get<CategoryTree[]>(`${this.apiUrl}/tree`);
  }

  getCategory(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/${id}`);
  }

  createCategory(category: CreateCategoryDTO): Observable<Category> {
    const formData = new FormData();
    
    Object.entries(category).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'image' && value instanceof File) {
          formData.append('image', value, value.name);
        } else if (key === 'is_active') {
          // Para boolean fields em FormData, enviar '1' ou '0'
          formData.append(key, value ? '1' : '0');
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    return this.http.post<Category>(this.apiUrl, formData);
  }

  updateCategory(category: UpdateCategoryDTO): Observable<Category> {
    const { id, image, ...rest } = category;

    // Normalizar tipos
    const payload: any = { ...rest };
    if (payload.parent_id === '' || payload.parent_id === null || payload.parent_id === undefined) {
      delete payload.parent_id;
    } else {
      payload.parent_id = Number(payload.parent_id);
    }
    if (payload.is_active !== undefined) payload.is_active = !!payload.is_active;

    // Com imagem: usar endpoint dedicado via POST para evitar method spoofing
    if (image instanceof File) {
      const formData = new FormData();
      // Garantir que 'name' seja enviado primeiro
      if (payload.name !== undefined && payload.name !== null) {
        formData.append('name', String(payload.name));
      }
      Object.entries(payload).forEach(([key, value]) => {
        if (key === 'name') return; // já enviado
        if (value !== undefined && value !== null) {
          if (typeof value === 'boolean') {
            formData.append(key, value ? '1' : '0');
          } else {
            formData.append(key, value.toString());
          }
        }
      });
      formData.append('image', image, image.name);
      return this.http.post<Category>(`${this.apiUrl}/${id}/update`, formData);
    }

    // Sem imagem: JSON via PUT
    return this.http.put<Category>(`${this.apiUrl}/${id}`, payload);
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  toggleStatus(id: number): Observable<Category> {
    return this.http.patch<Category>(`${this.apiUrl}/${id}/toggle-status`, {});
  }

  uploadImage(id: number, image: File): Observable<Category> {
    const formData = new FormData();
    formData.append('image', image, image.name);
    return this.http.post<Category>(`${this.apiUrl}/${id}/image`, formData);
  }

  deleteImage(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/image`);
  }

  validateSlug(slug: string, excludeId?: number): Observable<{ valid: boolean }> {
    let params = new HttpParams().set('slug', slug);
    if (excludeId) {
      params = params.set('exclude_id', excludeId.toString());
    }
    return this.http.get<{ valid: boolean }>(`${this.apiUrl}/validate-slug`, { params });
  }

  reorderCategories(categories: { id: number; position: number }[]): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/reorder`, { categories });
  }

  moveCategory(id: number, parent_id: number | null): Observable<Category> {
    return this.http.patch<Category>(`${this.apiUrl}/${id}/move`, { parent_id });
  }

  getCategoryStats(id: number): Observable<{
    products_count: number;
    active_products_count: number;
    total_value: number;
    low_stock_count: number;
  }> {
    return this.http.get<{
      products_count: number;
      active_products_count: number;
      total_value: number;
      low_stock_count: number;
    }>(`${this.apiUrl}/${id}/stats`);
  }
}

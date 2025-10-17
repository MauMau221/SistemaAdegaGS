import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface SalesReport {
  total_sales: number;
  total_revenue: number;
  average_ticket: number;
  sales_by_period: {
    date: string;
    sales: number;
    revenue: number;
  }[];
  sales_by_payment_method: {
    payment_method: string;
    count: number;
    total: number;
  }[];
  top_selling_products: {
    product_id: number;
    product_name: string;
    quantity_sold: number;
    revenue: number;
  }[];
  sales_by_category: {
    category_id: number;
    category_name: string;
    sales: number;
    revenue: number;
  }[];
}

export interface StockReport {
  total_products: number;
  total_stock_value: number;
  low_stock_products: {
    product_id: number;
    product_name: string;
    current_stock: number;
    min_stock: number;
    reorder_quantity: number;
  }[];
  stock_movements: {
    date: string;
    type: 'in' | 'out';
    quantity: number;
    value: number;
  }[];
  stock_by_category: {
    category_id: number;
    category_name: string;
    products_count: number;
    total_stock: number;
    total_value: number;
  }[];
}

export interface CustomerReport {
  total_customers: number;
  active_customers: number;
  new_customers: {
    date: string;
    count: number;
  }[];
  customer_segments: {
    segment: string;
    count: number;
    total_revenue: number;
    average_ticket: number;
  }[];
  retention_rate: number;
  churn_rate: number;
}

export interface EmployeeReport {
  total_employees: number;
  active_employees: number;
  sales_by_employee: {
    employee_id: number;
    employee_name: string;
    orders_count: number;
    total_sales: number;
    average_ticket: number;
  }[];
  cash_operations: {
    employee_id: number;
    employee_name: string;
    openings: number;
    closings: number;
    transactions: number;
    balance_accuracy: number;
  }[];
}

export interface ReportFilters {
  start_date?: string;
  end_date?: string;
  period?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  category_id?: number;
  payment_method?: string;
  employee_id?: number;
  include_inactive?: boolean;
}

export interface ReportExportOptions extends ReportFilters {
  format: 'pdf' | 'xlsx' | 'csv';
  report_type: 'sales' | 'stock' | 'customers' | 'employees';
}

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private apiUrl = `${environment.apiUrl}/admin/reports`;

  private normalizeArray<T = any>(value: any): T[] {
    if (Array.isArray(value)) return value as T[];
    if (value && typeof value === 'object') return Object.values(value) as T[];
    return [] as T[];
  }

  constructor(private http: HttpClient) {}

  getSalesReport(filters?: ReportFilters): Observable<SalesReport> {
    return this.http.get<any>(`${this.apiUrl}/sales`, {
      params: this.buildParams(filters)
    }).pipe(
      // Mapear payload do backend para SalesReport esperado no frontend
      // Estrutura backend: { summary: { total_orders, total_sales, average_order_value }, sales_data, ... }
      (source) => new Observable<SalesReport>(subscriber => {
        source.subscribe({
          next: (res) => {
            const summary = res?.summary || {};
            const mapped: SalesReport = {
              total_sales: summary.total_orders || 0,
              total_revenue: summary.total_sales || 0,
              average_ticket: summary.average_order_value || 0,
              sales_by_period: this.normalizeArray(res?.sales_data).map((d: any) => ({
                date: d.date,
                sales: d.orders_count || d.sales || 0,
                revenue: d.total_sales || d.revenue || 0,
              })),
              sales_by_payment_method: this.normalizeArray(res?.sales_by_payment).map((p: any) => ({
                payment_method: p.payment_method,
                count: p.count || 0,
                total: p.total || 0,
              })),
              top_selling_products: this.normalizeArray(res?.top_selling_products || []).map((p: any) => ({
                product_id: p.product_id || p.id,
                product_name: p.product_name || p.name,
                quantity_sold: p.quantity_sold || p.total_sold || 0,
                revenue: p.revenue || p.total_revenue || 0,
              })),
              sales_by_category: this.normalizeArray(res?.sales_by_category || []).map((c: any) => ({
                category_id: c.category_id || c.id,
                category_name: c.category_name || c.name,
                sales: c.sales || c.orders_count || 0,
                revenue: c.revenue || c.total_sales || 0,
              }))
            };
            subscriber.next(mapped);
            subscriber.complete();
          },
          error: (err) => subscriber.error(err)
        });
      })
    );
  }

  getStockReport(filters?: ReportFilters): Observable<StockReport> {
    return this.http.get<any>(`${this.apiUrl}/stock`, {
      params: this.buildParams(filters)
    }).pipe(
      (source) => new Observable<StockReport>(subscriber => {
        source.subscribe({
          next: (res) => {
            const mapped: StockReport = {
              total_products: res?.summary?.total_products || res?.total_products || 0,
              total_stock_value: res?.summary?.total_stock_value || res?.total_stock_value || 0,
              low_stock_products: this.normalizeArray(res?.low_stock_products).map((p: any) => ({
                product_id: p.id || p.product_id,
                product_name: p.name || p.product_name,
                current_stock: p.current_stock || 0,
                min_stock: p.min_stock || 0,
                reorder_quantity: Math.max((p.min_stock || 0) - (p.current_stock || 0), 0)
              })),
              stock_movements: this.normalizeArray(res?.stock_movements).map((m: any) => ({
                date: m.date,
                type: m.type,
                quantity: m.quantity,
                value: m.value
              })),
              stock_by_category: this.normalizeArray(res?.stock_by_category || []).map((c: any) => ({
                category_id: c.category_id || c.id,
                category_name: c.category_name || c.name,
                products_count: c.products_count || c.total_products || 0,
                total_stock: c.total_stock || 0,
                total_value: c.total_value || c.total_stock_value || 0
              }))
            };
            subscriber.next(mapped);
            subscriber.complete();
          },
          error: (err) => subscriber.error(err)
        });
      })
    );
  }

  getCustomerReport(filters?: ReportFilters): Observable<CustomerReport> {
    return this.http.get<any>(`${this.apiUrl}/customers`, {
      params: this.buildParams(filters)
    }).pipe(
      (source) => new Observable<CustomerReport>(subscriber => {
        source.subscribe({
          next: (res) => {
            const mapped: CustomerReport = {
              total_customers: res?.total_customers || 0,
              active_customers: res?.active_customers || 0,
              new_customers: this.normalizeArray(res?.new_customers).map((c: any) => ({
                date: c.date,
                count: c.count
              })),
              customer_segments: this.normalizeArray(res?.customer_segments).map((s: any) => ({
                segment: s.segment,
                count: s.count,
                total_revenue: s.total_revenue,
                average_ticket: s.total_revenue / (s.count || 1)
              })),
              retention_rate: res?.retention_rate || 0,
              churn_rate: res?.churn_rate || (100 - (res?.retention_rate || 0))
            };
            subscriber.next(mapped);
            subscriber.complete();
          },
          error: (err) => subscriber.error(err)
        });
      })
    );
  }

  getEmployeeReport(filters?: ReportFilters): Observable<EmployeeReport> {
    return this.http.get<any>(`${this.apiUrl}/employees`, {
      params: this.buildParams(filters)
    }).pipe(
      (source) => new Observable<EmployeeReport>(subscriber => {
        source.subscribe({
          next: (res) => {
            const mapped: EmployeeReport = {
              total_employees: res?.total_employees || 0,
              active_employees: res?.active_employees || 0,
              sales_by_employee: this.normalizeArray(res?.sales_by_employee).map((e: any) => ({
                employee_id: e.employee_id,
                employee_name: e.employee_name,
                orders_count: e.orders_count,
                total_sales: e.total_sales,
                average_ticket: e.total_sales / (e.orders_count || 1)
              })),
              cash_operations: this.normalizeArray(res?.cash_operations).map((o: any) => ({
                employee_id: o.employee_id,
                employee_name: o.employee_name,
                openings: o.openings || 0,
                closings: o.closings || 0,
                transactions: o.transactions,
                balance_accuracy: o.balance_accuracy
              }))
            };
            subscriber.next(mapped);
            subscriber.complete();
          },
          error: (err) => subscriber.error(err)
        });
      })
    );
  }

  exportReport(options: ReportExportOptions): Observable<Blob> {
    const { format, report_type, ...filters } = options;
    
    return this.http.get(`${this.apiUrl}/${report_type}/export`, {
      params: this.buildParams({ ...filters, format }),
      responseType: 'blob'
    });
  }

  private buildParams(filters?: any): HttpParams {
    let params = new HttpParams();
    
    if (!filters) return params;

    Object.keys(filters).forEach(key => {
      const value = filters[key];
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return params;
  }
}

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
  private apiUrl = `${environment.apiUrl}/reports`;

  constructor(private http: HttpClient) {}

  getSalesReport(filters?: ReportFilters): Observable<SalesReport> {
    return this.http.get<SalesReport>(`${this.apiUrl}/sales`, {
      params: this.buildParams(filters)
    });
  }

  getStockReport(filters?: ReportFilters): Observable<StockReport> {
    return this.http.get<StockReport>(`${this.apiUrl}/stock`, {
      params: this.buildParams(filters)
    });
  }

  getCustomerReport(filters?: ReportFilters): Observable<CustomerReport> {
    return this.http.get<CustomerReport>(`${this.apiUrl}/customers`, {
      params: this.buildParams(filters)
    });
  }

  getEmployeeReport(filters?: ReportFilters): Observable<EmployeeReport> {
    return this.http.get<EmployeeReport>(`${this.apiUrl}/employees`, {
      params: this.buildParams(filters)
    });
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

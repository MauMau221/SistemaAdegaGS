import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface AdminDashboardSummary {
  sales: {
    today: number;
    week: number;
    month: number;
    total_orders: number;
    average_ticket: number;
    by_payment_method: {
      method: string;
      count: number;
      total: number;
    }[];
  };
  stock: {
    total_products: number;
    low_stock_count: number;
    out_of_stock_count: number;
    total_value: number;
    categories_count: number;
  };
  users: {
    total: number;
    customers: number;
    employees: number;
    admins: number;
    new_this_month: number;
  };
  orders: {
    pending: number;
    delivering: number;
    completed: number;
    cancelled: number;
    total_amount: number;
  };
}

export interface SalesChart {
  labels: string[];
  data: number[];
}

export interface TopProducts {
  id: number;
  name: string;
  quantity_sold: number;
  total_revenue: number;
}

export interface TopCustomers {
  id: number;
  name: string;
  orders_count: number;
  total_spent: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminDashboardService {
  private apiUrl = `${environment.apiUrl}/admin/dashboard`;

  constructor(private http: HttpClient) {}

  getSummary(): Observable<AdminDashboardSummary> {
    return this.http.get<AdminDashboardSummary>(`${this.apiUrl}/summary`);
  }

  getSalesChart(period: 'day' | 'week' | 'month' | 'year'): Observable<SalesChart> {
    return this.http.get<SalesChart>(`${this.apiUrl}/sales-chart`, {
      params: { period }
    });
  }

  getTopProducts(limit: number = 5): Observable<TopProducts[]> {
    return this.http.get<TopProducts[]>(`${this.apiUrl}/top-products`, {
      params: { limit: limit.toString() }
    });
  }

  getTopCustomers(limit: number = 5): Observable<TopCustomers[]> {
    return this.http.get<TopCustomers[]>(`${this.apiUrl}/top-customers`, {
      params: { limit: limit.toString() }
    });
  }

  getDashboardData(): Observable<{
    summary: AdminDashboardSummary;
    salesChart: SalesChart;
    topProducts: TopProducts[];
    topCustomers: TopCustomers[];
  }> {
    return combineLatest([
      this.getSummary(),
      this.getSalesChart('month'),
      this.getTopProducts(),
      this.getTopCustomers()
    ]).pipe(
      map(([summary, salesChart, topProducts, topCustomers]) => ({
        summary,
        salesChart,
        topProducts,
        topCustomers
      }))
    );
  }
}

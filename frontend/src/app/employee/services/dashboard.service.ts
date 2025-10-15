import { Injectable } from '@angular/core';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { CashService } from './cash.service';
import { OrderService } from './order.service';
import { StockService } from '../../core/services/stock.service';
import { DashboardSummary } from '../models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(
    private cashService: CashService,
    private orderService: OrderService,
    private stockService: StockService
  ) {}

  getSummary(): Observable<DashboardSummary> {
    return combineLatest([
      this.cashService.getStatus(),
      this.orderService.getOrdersSummary(),
      this.stockService.getSummary()
    ]).pipe(
      map(([cash, orders, stock]) => ({
        sales: {
          total_amount: orders.total_amount,
          total_orders: orders.total_orders
        },
        orders: {
          pending: orders.pending,
          delivering: orders.delivering,
          completed: orders.completed
        },
        cash: {
          is_open: cash.is_open,
          current_amount: cash.current_amount
        },
        stock: {
          total_products: stock.total_products,
          low_stock_count: stock.low_stock_count
        }
      }))
    );
  }
}
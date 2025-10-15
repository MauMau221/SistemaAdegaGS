import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CashStatus, CashTransaction, CashReport } from '../models/cash.model';

@Injectable({
  providedIn: 'root'
})
export class CashService {
  private apiUrl = `${environment.apiUrl}/cash`;
  private mockData = {
    status: {
      is_open: false,
      opened_at: undefined,
      opened_by: undefined,
      initial_amount: 0,
      current_amount: 0
    } as CashStatus,
    transactions: [] as CashTransaction[]
  };

  constructor(private http: HttpClient) {}

  // Mock implementation until backend is ready
  private useMock = true;

  openCash(initialAmount: number): Observable<CashStatus> {
    if (this.useMock) {
      this.mockData.status = {
        is_open: true,
        opened_at: new Date().toISOString(),
        opened_by: 'Funcionário',
        initial_amount: initialAmount,
        current_amount: initialAmount
      };
      return of(this.mockData.status);
    }
    return this.http.post<CashStatus>(`${this.apiUrl}/open`, { initial_amount: initialAmount });
  }

  closeCash(): Observable<CashReport> {
    if (this.useMock) {
      const report: CashReport = {
        date: new Date().toISOString(),
        opening_balance: this.mockData.status.initial_amount,
        closing_balance: this.mockData.status.current_amount,
        total_income: this.mockData.transactions
          .filter(t => t.type === 'entrada')
          .reduce((sum, t) => sum + t.amount, 0),
        total_outcome: this.mockData.transactions
          .filter(t => t.type === 'saida')
          .reduce((sum, t) => sum + t.amount, 0),
        transactions: this.mockData.transactions
      };
      this.mockData.status.is_open = false;
      this.mockData.transactions = [];
      return of(report);
    }
    return this.http.post<CashReport>(`${this.apiUrl}/close`, {});
  }

  addTransaction(transaction: Omit<CashTransaction, 'id' | 'created_at' | 'created_by'>): Observable<CashTransaction> {
    if (this.useMock) {
      const newTransaction: CashTransaction = {
        ...transaction,
        id: Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString(),
        created_by: 'Funcionário'
      };
      this.mockData.transactions.push(newTransaction);
      this.mockData.status.current_amount += transaction.type === 'entrada' ? 
        transaction.amount : -transaction.amount;
      return of(newTransaction);
    }
    return this.http.post<CashTransaction>(`${this.apiUrl}/transaction`, transaction);
  }

  getStatus(): Observable<CashStatus> {
    if (this.useMock) {
      return of(this.mockData.status);
    }
    return this.http.get<CashStatus>(`${this.apiUrl}/status`);
  }

  getTodayTransactions(): Observable<CashTransaction[]> {
    if (this.useMock) {
      return of(this.mockData.transactions);
    }
    return this.http.get<CashTransaction[]>(`${this.apiUrl}/today`);
  }

  generateReport(date?: string): Observable<CashReport> {
    if (this.useMock) {
      return of({
        date: date || new Date().toISOString(),
        opening_balance: this.mockData.status.initial_amount,
        closing_balance: this.mockData.status.current_amount,
        total_income: this.mockData.transactions
          .filter(t => t.type === 'entrada')
          .reduce((sum, t) => sum + t.amount, 0),
        total_outcome: this.mockData.transactions
          .filter(t => t.type === 'saida')
          .reduce((sum, t) => sum + t.amount, 0),
        transactions: this.mockData.transactions
      });
    }
    const params = date ? new HttpParams().set('date', date) : undefined;
    return this.http.get<CashReport>(`${this.apiUrl}/report`, { params });
  }
}
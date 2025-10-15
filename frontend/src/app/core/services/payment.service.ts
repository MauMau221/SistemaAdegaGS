import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  constructor(private http: HttpClient) {}

  gerarPix(orderId: number): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/orders/${orderId}/payments/pix`, {});
  }

  pagarCartao(orderId: number, paymentData: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/orders/${orderId}/payments/card`, paymentData);
  }

  verificarStatus(paymentId: string): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/payments/${paymentId}/status`);
  }
}

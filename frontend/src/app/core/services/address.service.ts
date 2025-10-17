import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Address {
  id: number;
  name?: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipcode: string;
  notes?: string;
  is_default: boolean;
  is_active: boolean;
  full_address?: string;
  short_address?: string;
}

export interface CreateAddressRequest {
  name?: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipcode: string;
  notes?: string;
  is_default?: boolean;
}

export interface UpdateAddressRequest extends CreateAddressRequest {
  id: number;
}

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  private apiUrl = `${environment.apiUrl}/addresses`;

  constructor(private http: HttpClient) {}

  getAddresses(): Observable<Address[]> {
    return this.http.get<Address[]>(this.apiUrl);
  }

  getAddress(id: number): Observable<Address> {
    return this.http.get<Address>(`${this.apiUrl}/${id}`);
  }

  createAddress(address: CreateAddressRequest): Observable<Address> {
    return this.http.post<Address>(this.apiUrl, address);
  }

  updateAddress(id: number, address: Partial<CreateAddressRequest>): Observable<Address> {
    return this.http.put<Address>(`${this.apiUrl}/${id}`, address);
  }

  deleteAddress(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  setDefaultAddress(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/default`, {});
  }

  formatAddress(address: Address): string {
    let formatted = `${address.street}, ${address.number}`;
    
    if (address.complement) {
      formatted += `, ${address.complement}`;
    }
    
    formatted += ` - ${address.neighborhood}, ${address.city}/${address.state}`;
    
    if (address.zipcode) {
      formatted += ` - CEP: ${address.zipcode}`;
    }
    
    return formatted;
  }

  formatShortAddress(address: Address): string {
    return `${address.neighborhood}, ${address.city}`;
  }
}

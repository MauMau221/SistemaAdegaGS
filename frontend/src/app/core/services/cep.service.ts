import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface CepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

export interface CepFormatted {
  street: string;
  neighborhood: string;
  city: string;
  state: string;
  zipcode: string;
}

@Injectable({
  providedIn: 'root'
})
export class CepService {
  private readonly VIA_CEP_URL = 'https://viacep.com.br/ws';

  constructor(private http: HttpClient) {}

  /**
   * Busca dados do CEP via API ViaCEP
   * @param cep CEP no formato 00000-000 ou 00000000
   * @returns Observable com os dados do endereço
   */
  searchCep(cep: string): Observable<CepFormatted> {
    // Remove caracteres não numéricos
    const cleanCep = cep.replace(/\D/g, '');
    
    if (cleanCep.length !== 8) {
      throw new Error('CEP deve ter 8 dígitos');
    }

    return this.http.get<CepResponse>(`${this.VIA_CEP_URL}/${cleanCep}/json`).pipe(
      map(response => {
        if (response.erro) {
          throw new Error('CEP não encontrado');
        }

        return {
          street: response.logradouro,
          neighborhood: response.bairro,
          city: response.localidade,
          state: response.uf,
          zipcode: response.cep
        };
      }),
      catchError(error => {
        console.error('Erro ao buscar CEP:', error);
        throw new Error('Erro ao buscar CEP. Verifique se o CEP está correto.');
      })
    );
  }

  /**
   * Formata CEP para exibição (00000-000)
   * @param cep CEP sem formatação
   * @returns CEP formatado
   */
  formatCep(cep: string): string {
    const cleanCep = cep.replace(/\D/g, '');
    return cleanCep.replace(/^(\d{5})(\d{3}).*/, '$1-$2');
  }

  /**
   * Remove formatação do CEP (apenas números)
   * @param cep CEP formatado
   * @returns CEP apenas com números
   */
  cleanCep(cep: string): string {
    return cep.replace(/\D/g, '');
  }

  /**
   * Valida se o CEP tem formato válido
   * @param cep CEP para validar
   * @returns true se válido
   */
  isValidCep(cep: string): boolean {
    const cleanCep = this.cleanCep(cep);
    return cleanCep.length === 8 && /^\d{8}$/.test(cleanCep);
  }
}

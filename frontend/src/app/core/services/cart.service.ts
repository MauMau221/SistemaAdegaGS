import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Product } from '../models/product.model';
import { AuthService } from './auth.service';
import { HttpClient } from '@angular/common/http';

import { CartItem, CartState } from '../models/cart.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private initialState: CartState = {
    items: [],
    total: 0,
    isOpen: false
  };

  private cartState = new BehaviorSubject<CartState>(this.initialState);

  cartItems$ = this.cartState.pipe(map(state => state.items || []));
  isCartOpen$ = this.cartState.pipe(map(state => state.isOpen));
  itemAdded$ = new BehaviorSubject<boolean>(false);

  constructor(
    private authService: AuthService,
    private http: HttpClient
  ) {
    // Carregar carrinho do localStorage
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        const { items, total } = JSON.parse(savedCart);
        if (Array.isArray(items)) {
          this.cartState.next({ items, total: total || 0, isOpen: false });
        }
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      localStorage.removeItem('cart');
    }

    // Observar mudanças no estado de autenticação
    this.authService.user$.subscribe(user => {
      if (!user) {
        // Se deslogou, manter apenas o carrinho local
        const localCart = localStorage.getItem('cart');
        if (localCart) {
          const { items, total } = JSON.parse(localCart);
          this.cartState.next({ items, total, isOpen: false });
        }
      } else {
        // Se logou, buscar carrinho do servidor e mesclar com o local
        // TODO: Implementar sincronização com o servidor
      }
    });
  }

  private saveCart(): void {
    console.log('Saving cart to localStorage');
    const state = this.cartState.value || this.initialState;
    const cartData = {
      items: state.items || [],
      total: state.total || 0
    };
    console.log('Cart data to save:', cartData);
    localStorage.setItem('cart', JSON.stringify(cartData));
  }

  private calculateTotal(items: CartItem[]): number {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  addItem(product: Product, quantity: number = 1): void {
    console.log('CartService.addItem:', { product, quantity });
    
    const currentState = this.cartState.value || this.initialState;
    console.log('Current state:', currentState);
    
    const items = currentState.items || [];
    const existingItem = items.find(item => item.id === product.id);
    console.log('Existing item:', existingItem);

    let updatedItems;
    if (existingItem) {
      console.log('Updating existing item');
      updatedItems = items.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    } else {
      console.log('Adding new item');
      const newItem: CartItem = {
        id: product.id,
        product,
        quantity,
        price: product.price
      };
      updatedItems = [...items, newItem];
    }

    console.log('Updated items:', updatedItems);
    const total = this.calculateTotal(updatedItems);
    console.log('New total:', total);

    const newState = {
      ...currentState,
      items: updatedItems,
      total,
      isOpen: true
    };
    console.log('New state:', newState);

    this.cartState.next(newState);
    this.saveCart();
    
    // Disparar animação
    this.itemAdded$.next(true);
    setTimeout(() => this.itemAdded$.next(false), 300);

    // Se estiver autenticado, sincronizar com o servidor
    if (this.authService.isLoggedIn()) {
      // TODO: Implementar sincronização com o servidor
    }
  }

  removeItem(productId: number): void {
    const currentState = this.cartState.value || this.initialState;
    const items = currentState.items || [];
    const updatedItems = items.filter(item => item.id !== productId);
    
    const total = this.calculateTotal(updatedItems);
    const newState = {
      ...currentState,
      items: updatedItems,
      total
    };

    this.cartState.next(newState);
    this.saveCart();

    // Se estiver autenticado, sincronizar com o servidor
    if (this.authService.isLoggedIn()) {
      // TODO: Implementar sincronização com o servidor
    }
  }

  updateQuantity(productId: number, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(productId);
      return;
    }

    const currentState = this.cartState.value || this.initialState;
    const items = currentState.items || [];
    const updatedItems = items.map(item =>
      item.id === productId ? { ...item, quantity } : item
    );

    const total = this.calculateTotal(updatedItems);
    const newState = {
      ...currentState,
      items: updatedItems,
      total
    };

    this.cartState.next(newState);
    this.saveCart();

    // Se estiver autenticado, sincronizar com o servidor
    if (this.authService.isLoggedIn()) {
      // TODO: Implementar sincronização com o servidor
    }
  }

  clearCart(): void {
    this.cartState.next({
      items: [],
      total: 0,
      isOpen: false
    });
    localStorage.removeItem('cart');
  }

  openCart(): void {
    this.cartState.next({
      ...this.cartState.value,
      isOpen: true
    });
  }

  closeCart(): void {
    this.cartState.next({
      ...this.cartState.value,
      isOpen: false
    });
  }

  toggleCart(): void {
    this.cartState.next({
      ...this.cartState.value,
      isOpen: !this.cartState.value.isOpen
    });
  }

  async finishOrder(orderData: any): Promise<any> {
    try {
      // Verificar se está autenticado
      if (!this.authService.isLoggedIn()) {
        throw new Error('Usuário não autenticado');
      }

      // Preparar dados do pedido
      const order = {
        ...orderData,
        items: this.cartState.value.items,
        total: this.cartState.value.total
      };

      // Enviar pedido para o servidor
      const response = await this.http.post('/api/orders', order).toPromise();

      // Se o pedido foi bem sucedido, limpar o carrinho
      this.clearCart();

      return response;
    } catch (error) {
      console.error('Erro ao finalizar pedido:', error);
      throw error;
    }
  }
}
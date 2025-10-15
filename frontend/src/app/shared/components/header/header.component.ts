import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { CartItem } from '../../../core/models/cart.model';
import { User } from '../../../core/models/auth.model';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule
  ]
})
export class HeaderComponent implements OnInit {
  searchTerm: string = '';
  isMobileMenuOpen = false;
  
  private cartService = inject(CartService);
  private authService = inject(AuthService);
  private router = inject(Router);

  cartTotal$ = this.cartService.cartItems$.pipe(
    map((items: CartItem[]) => items.reduce((total: number, item: CartItem) => total + (item.quantity * item.price), 0))
  );
  user$ = this.authService.user$;

  constructor() {}

  ngOnInit(): void {
  }

  onSearch(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.router.navigate(['/produtos'], {
        queryParams: { busca: this.searchTerm }
      });
    }
  }

  toggleCart(): void {
    this.cartService.toggleCart();
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  logout(): void {
    console.log('Logout iniciado');
    this.authService.logout().subscribe({
      next: () => {
        console.log('Logout bem sucedido');
        // Limpar o carrinho ao fazer logout
        this.cartService.clearCart();
        
        // Verificar se o usuário foi limpo
        this.authService.user$.subscribe(user => {
          console.log('Estado do usuário após logout:', user);
        });
        
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Erro ao fazer logout:', error);
        // Mesmo com erro, vamos limpar o estado local
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        this.cartService.clearCart();
        this.router.navigate(['/']);
      }
    });
  }
}
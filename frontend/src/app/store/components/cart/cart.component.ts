import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../core/services/cart.service';
import { CartItem } from '../../../core/models/cart.model';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class CartComponent {
  constructor(
    private cartService: CartService,
    private router: Router
  ) {}

  get cartItems$() {
    return this.cartService.cartItems$;
  }

  updateQuantity(item: CartItem, newQuantity: number): void {
    if (newQuantity > 0 && newQuantity <= item.product.current_stock) {
      this.cartService.updateQuantity(item.product.id, newQuantity);
    }
  }

  removeItem(item: CartItem): void {
    this.cartService.removeItem(item.product.id);
  }

  getTotal(): number {
    return this.cartService.getTotal();
  }

  checkout(): void {
    this.router.navigate(['/loja/checkout']);
  }

  continueShopping(): void {
    this.router.navigate(['/loja']);
  }
}
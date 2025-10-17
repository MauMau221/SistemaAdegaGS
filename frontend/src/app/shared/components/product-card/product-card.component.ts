import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Product } from '../../../core/models/product.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class ProductCardComponent {
  @Input() product!: Product;
  @Output() addToCart = new EventEmitter<Product>();

  onAddToCart(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.addToCart.emit(this.product);
  }

  getImageUrl(product: Product): string {
    const imageUrl = (product as any).image_url as string | undefined;
    if (imageUrl) {
      if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        return `${imageUrl}?v=${encodeURIComponent(product.updated_at as any)}`;
      }
      if (imageUrl.startsWith('/storage/') || imageUrl.startsWith('storage/')) {
        const base = environment.apiUrl.replace(/\/api$/, '');
        const path = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
        return `${base}${path}?v=${encodeURIComponent(product.updated_at as any)}`;
      }
      return `${imageUrl}?v=${encodeURIComponent(product.updated_at as any)}`;
    }
    const first = product.images?.[0];
    if (first) return first;
    return 'assets/images/no-image.jpg';
  }

  getLowStock(product: Product): boolean {
    const current = (product as any).current_stock ?? 0;
    const min = (product as any).min_stock ?? 0;
    return current <= min;
  }
}
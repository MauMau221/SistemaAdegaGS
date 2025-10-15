import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { Product, Category } from '../../../core/models/product.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class HomeComponent implements OnInit {
  categories: Category[] = [];
  featuredProducts: Product[] = [];
  popularProducts: Product[] = [];
  loading = {
    categories: true,
    featured: true,
    popular: true
  };
  error = {
    categories: null as string | null,
    featured: null as string | null,
    popular: null as string | null
  };

  constructor(
    private productService: ProductService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadFeaturedProducts();
    this.loadPopularProducts();
  }

  loadCategories(): void {
    this.loading.categories = true;
    this.error.categories = null;

    this.productService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.loading.categories = false;
      },
      error: (error) => {
        console.error('Erro ao carregar categorias:', error);
        this.error.categories = 'Erro ao carregar categorias';
        this.loading.categories = false;
      }
    });
  }

  loadFeaturedProducts(): void {
    this.loading.featured = true;
    this.error.featured = null;

    this.productService.getFeaturedProducts().subscribe({
      next: (products) => {
        this.featuredProducts = products;
        this.loading.featured = false;
      },
      error: (error) => {
        console.error('Erro ao carregar produtos em destaque:', error);
        this.error.featured = 'Erro ao carregar produtos em destaque';
        this.loading.featured = false;
      }
    });
  }

  loadPopularProducts(): void {
    this.loading.popular = true;
    this.error.popular = null;

    this.productService.getPopularProducts().subscribe({
      next: (products) => {
        this.popularProducts = products;
        this.loading.popular = false;
      },
      error: (error) => {
        console.error('Erro ao carregar produtos populares:', error);
        this.error.popular = 'Erro ao carregar produtos populares';
        this.loading.popular = false;
      }
    });
  }

  addToCart(product: Product): void {
    this.cartService.addItem(product);
  }

  trackByProductId(index: number, product: Product): number {
    return product.id;
  }

  trackByCategoryId(index: number, category: Category): number {
    return category.id;
  }
}
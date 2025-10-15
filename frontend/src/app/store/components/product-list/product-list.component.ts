import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Product, Category } from '../../../core/models/product.model';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];
  selectedCategory: number | null = null;
  loading = true;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    
    this.route.queryParams.subscribe(params => {
      this.selectedCategory = params['categoria'] ? +params['categoria'] : null;
      this.loadProducts();
    });
  }

  loadCategories(): void {
    this.productService.getCategories().subscribe(
      categories => this.categories = categories
    );
  }

  loadProducts(): void {
    const params: any = {};
    if (this.selectedCategory) {
      params.category_id = this.selectedCategory;
    }

    this.loading = true;
    this.productService.getProducts(params).subscribe(
      response => {
        this.products = response.data;
        this.loading = false;
      }
    );
  }

  addToCart(product: Product): void {
    this.cartService.addItem(product);
  }
}
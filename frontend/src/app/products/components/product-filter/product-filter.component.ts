import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../core/services/product.service';
import { Category } from '../../../core/models/product.model';

@Component({
  selector: 'app-product-filter',
  templateUrl: './product-filter.component.html',
  styleUrls: ['./product-filter.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class ProductFilterComponent implements OnInit {
  @Input() selectedCategory: number | null = null;
  @Output() categoryChange = new EventEmitter<number | null>();

  categories: Category[] = [];
  loading = true;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.productService.getCategories().subscribe(
      categories => {
        this.categories = categories;
        this.loading = false;
      }
    );
  }

  selectCategory(categoryId: number | null): void {
    this.selectedCategory = categoryId;
    this.categoryChange.emit(categoryId);
  }
}

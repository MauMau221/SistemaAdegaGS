import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, takeUntil } from 'rxjs';

import { StockService, StockSummary, StockResponse } from '../../../core/services/stock.service';
import { Product } from '../../services/order.service';
import { StockMovementDialogComponent } from '../../components/stock-movement-dialog/stock-movement-dialog.component';

@Component({
  selector: 'app-estoque',
  templateUrl: './estoque.component.html',
  styleUrls: ['./estoque.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatDialogModule,
    MatSnackBarModule,
    MatPaginatorModule,
    MatChipsModule,
    MatBadgeModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ]
})
export class EstoqueComponent implements OnInit, OnDestroy {
  displayedColumns = ['name', 'category', 'stock_quantity', 'price', 'actions'];
  products: Product[] = [];
  summary: StockSummary | null = null;
  loading = true;
  searchTerm = '';
  showLowStock = false;

  // Paginação
  totalItems = 0;
  pageSize = 10;
  currentPage = 0;

  private destroy$ = new Subject<void>();

  constructor(
    private stockService: StockService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadSummary();
    this.loadProducts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadSummary(): void {
    this.stockService.getSummary()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (summary: StockSummary) => this.summary = summary,
        error: (error: Error) => {
          console.error('Erro ao carregar resumo do estoque:', error);
          this.snackBar.open('Erro ao carregar resumo do estoque', 'Fechar', { duration: 3000 });
        }
      });
  }

  loadProducts(): void {
    this.loading = true;
    const params = {
      search: this.searchTerm,
      page: this.currentPage + 1,
      per_page: this.pageSize,
      low_stock: this.showLowStock
    };

    this.stockService.getStock(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: StockResponse) => {
          this.products = response.data;
          this.totalItems = response.total;
          this.loading = false;
        },
        error: (error: Error) => {
          console.error('Erro ao carregar produtos:', error);
          this.snackBar.open('Erro ao carregar produtos', 'Fechar', { duration: 3000 });
          this.loading = false;
        }
      });
  }

  onSearch(): void {
    this.currentPage = 0;
    this.loadProducts();
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.loadProducts();
  }

  toggleLowStock(): void {
    this.showLowStock = !this.showLowStock;
    this.currentPage = 0;
    this.loadProducts();
  }

  openStockMovement(product: Product): void {
    const dialogRef = this.dialog.open(StockMovementDialogComponent, {
      width: '500px',
      data: { product }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.stockService.updateStock(product.id, result)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.snackBar.open('Estoque atualizado com sucesso', 'Fechar', { duration: 3000 });
              this.loadSummary();
              this.loadProducts();
            },
            error: (error: Error) => {
              console.error('Erro ao atualizar estoque:', error);
              this.snackBar.open('Erro ao atualizar estoque', 'Fechar', { duration: 3000 });
            }
          });
      }
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  getStockColor(quantity: number, minQuantity: number): string {
    if (quantity === 0) return '#f44336'; // Vermelho
    if (quantity <= minQuantity) return '#ff9800'; // Laranja
    return '#4caf50'; // Verde
  }
}
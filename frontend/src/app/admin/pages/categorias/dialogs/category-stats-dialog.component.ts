import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';

import { CategoryService, Category } from '../../../services/category.service';

@Component({
  selector: 'app-category-stats-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule
  ],
  template: `
    <h2 mat-dialog-title>Estatísticas da Categoria</h2>
    
    <mat-dialog-content>
      <div class="stats-container">
        <!-- Loading State -->
        <div *ngIf="loading" class="loading-state">
          <mat-spinner diameter="40"></mat-spinner>
          <p>Carregando estatísticas...</p>
        </div>

        <!-- Stats Content -->
        <div *ngIf="!loading && stats" class="stats-content">
          <div class="stats-header">
            <h3>{{data.category.name}}</h3>
            <p *ngIf="data.category.description">{{data.category.description}}</p>
          </div>

          <mat-divider></mat-divider>

          <!-- Produtos -->
          <div class="stats-section">
            <div class="stat-item">
              <div class="stat-icon">
                <mat-icon>inventory_2</mat-icon>
              </div>
              <div class="stat-info">
                <span class="stat-label">Total de Produtos</span>
                <span class="stat-value">{{stats.products_count}}</span>
              </div>
            </div>

            <div class="stat-item">
              <div class="stat-icon">
                <mat-icon>check_circle</mat-icon>
              </div>
              <div class="stat-info">
                <span class="stat-label">Produtos Ativos</span>
                <span class="stat-value">{{stats.active_products_count}}</span>
              </div>
            </div>

            <div class="stat-item">
              <div class="stat-icon warning">
                <mat-icon>warning</mat-icon>
              </div>
              <div class="stat-info">
                <span class="stat-label">Estoque Baixo</span>
                <span class="stat-value">{{stats.low_stock_count}}</span>
              </div>
            </div>

            <div class="stat-item">
              <div class="stat-icon">
                <mat-icon>payments</mat-icon>
              </div>
              <div class="stat-info">
                <span class="stat-label">Valor Total em Estoque</span>
                <span class="stat-value">{{formatCurrency(stats.total_value)}}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Error State -->
        <div *ngIf="!loading && error" class="error-state">
          <mat-icon color="warn">error</mat-icon>
          <p>Erro ao carregar estatísticas</p>
        </div>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close()">Fechar</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .stats-container {
      min-width: 400px;
      padding: 16px 0;
    }

    .loading-state,
    .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px;
      text-align: center;
    }

    .loading-state p,
    .error-state p {
      margin: 16px 0 0;
      color: #666;
    }

    .error-state mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
    }

    .stats-header {
      margin-bottom: 24px;
      text-align: center;
    }

    .stats-header h3 {
      margin: 0;
      font-size: 20px;
      color: #333;
    }

    .stats-header p {
      margin: 8px 0 0;
      color: #666;
    }

    .stats-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 24px;
      margin: 24px 0;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background-color: #f5f5f5;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-icon.warning {
      background-color: #fff3e0;
    }

    .stat-icon.warning mat-icon {
      color: #ff9800;
    }

    .stat-info {
      display: flex;
      flex-direction: column;
    }

    .stat-label {
      font-size: 14px;
      color: #666;
    }

    .stat-value {
      font-size: 18px;
      font-weight: 500;
      color: #333;
    }

    @media (max-width: 600px) {
      .stats-container {
        min-width: auto;
      }

      .stats-section {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class CategoryStatsDialogComponent implements OnInit {
  loading = true;
  error = false;
  stats: {
    products_count: number;
    active_products_count: number;
    total_value: number;
    low_stock_count: number;
  } | null = null;

  constructor(
    public dialogRef: MatDialogRef<CategoryStatsDialogComponent>,
    private categoryService: CategoryService,
    @Inject(MAT_DIALOG_DATA) public data: { category: Category }
  ) {}

  ngOnInit(): void {
    this.loadStats();
  }

  private loadStats(): void {
    this.categoryService.getCategoryStats(this.data.category.id)
      .subscribe({
        next: (stats) => {
          this.stats = stats;
          this.loading = false;
        },
        error: (error) => {
          console.error('Erro ao carregar estatísticas:', error);
          this.error = true;
          this.loading = false;
        }
      });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }
}

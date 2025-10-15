import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';

import { UserService, User, UserStats } from '../../../services/user.service';

@Component({
  selector: 'app-user-stats-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatTableModule
  ],
  template: `
    <h2 mat-dialog-title>Estatísticas do Cliente</h2>
    
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
            <h3>{{data.user.name}}</h3>
            <p>{{data.user.email}}</p>
            <p *ngIf="data.user.phone">{{data.user.phone}}</p>
          </div>

          <mat-divider></mat-divider>

          <!-- Resumo -->
          <div class="stats-section">
            <div class="stat-item">
              <div class="stat-icon">
                <mat-icon>shopping_cart</mat-icon>
              </div>
              <div class="stat-info">
                <span class="stat-label">Total de Pedidos</span>
                <span class="stat-value">{{stats.total_orders}}</span>
              </div>
            </div>

            <div class="stat-item">
              <div class="stat-icon">
                <mat-icon>payments</mat-icon>
              </div>
              <div class="stat-info">
                <span class="stat-label">Total Gasto</span>
                <span class="stat-value">{{formatCurrency(stats.total_spent)}}</span>
              </div>
            </div>

            <div class="stat-item">
              <div class="stat-icon">
                <mat-icon>trending_up</mat-icon>
              </div>
              <div class="stat-info">
                <span class="stat-label">Ticket Médio</span>
                <span class="stat-value">{{formatCurrency(stats.average_order_value)}}</span>
              </div>
            </div>

            <div class="stat-item" *ngIf="stats.last_order_date">
              <div class="stat-icon">
                <mat-icon>event</mat-icon>
              </div>
              <div class="stat-info">
                <span class="stat-label">Último Pedido</span>
                <span class="stat-value">{{formatDate(stats.last_order_date)}}</span>
              </div>
            </div>
          </div>

          <mat-divider></mat-divider>

          <!-- Produtos Favoritos -->
          <div class="favorite-products">
            <h4>Produtos Mais Comprados</h4>
            
            <table mat-table [dataSource]="stats.favorite_products">
              <!-- Nome -->
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Produto</th>
                <td mat-cell *matCellDef="let product">{{product.product_name}}</td>
              </ng-container>

              <!-- Quantidade -->
              <ng-container matColumnDef="quantity">
                <th mat-header-cell *matHeaderCellDef>Quantidade</th>
                <td mat-cell *matCellDef="let product">{{product.quantity}}</td>
              </ng-container>

              <!-- Total -->
              <ng-container matColumnDef="total">
                <th mat-header-cell *matHeaderCellDef>Total Gasto</th>
                <td mat-cell *matCellDef="let product">
                  {{formatCurrency(product.total_spent)}}
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="['name', 'quantity', 'total']"></tr>
              <tr mat-row *matRowDef="let row; columns: ['name', 'quantity', 'total'];"></tr>
            </table>

            <!-- Empty State -->
            <div *ngIf="stats.favorite_products.length === 0" class="empty-state">
              <p>Nenhum produto comprado ainda</p>
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
      min-width: 500px;
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

    .favorite-products {
      margin: 24px 0;
    }

    .favorite-products h4 {
      margin: 0 0 16px;
      font-size: 16px;
      color: #333;
    }

    table {
      width: 100%;
    }

    .empty-state {
      text-align: center;
      padding: 24px;
      color: #666;
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
export class UserStatsDialogComponent implements OnInit {
  loading = true;
  error = false;
  stats: UserStats | null = null;

  constructor(
    public dialogRef: MatDialogRef<UserStatsDialogComponent>,
    private userService: UserService,
    @Inject(MAT_DIALOG_DATA) public data: { user: User }
  ) {}

  ngOnInit(): void {
    this.loadStats();
  }

  private loadStats(): void {
    this.userService.getUserStats(this.data.user.id)
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

  formatDate(date: string): string {
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { AdminDashboardService, AdminDashboardSummary, TopProducts, TopCustomers } from '../../services/admin-dashboard.service';
// import { NgChartsModule } from 'ng2-charts';
// import { ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatTableModule,
    RouterModule,
    // NgChartsModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  loading = true;
  summary: AdminDashboardSummary | null = null;
  topProducts: TopProducts[] = [];
  topCustomers: TopCustomers[] = [];

  // Configuração do gráfico de vendas (temporariamente desabilitado)
  salesChartData: any = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Vendas',
        backgroundColor: 'rgba(63, 81, 181, 0.2)',
        borderColor: 'rgb(63, 81, 181)',
        pointBackgroundColor: 'rgb(63, 81, 181)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(63, 81, 181)',
        fill: 'origin',
      }
    ]
  };

  salesChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    elements: {
      line: {
        tension: 0.4
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    },
    plugins: {
      legend: {
        display: false
      }
    }
  };

  private destroy$ = new Subject<void>();

  constructor(private dashboardService: AdminDashboardService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDashboardData(): void {
    this.dashboardService.getDashboardData()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.summary = data.summary;
          this.topProducts = data.topProducts;
          this.topCustomers = data.topCustomers;
          this.updateSalesChart(data.salesChart);
          this.loading = false;
        },
        error: (error) => {
          console.error('Erro ao carregar dados do dashboard:', error);
          this.loading = false;
        }
      });
  }

  private updateSalesChart(chartData: { labels: string[], data: number[] }): void {
    this.salesChartData.labels = chartData.labels;
    this.salesChartData.datasets[0].data = chartData.data;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('pt-BR').format(value);
  }

  getStatusColor(count: number, threshold: number): string {
    if (count === 0) return '#4caf50'; // Verde
    if (count > threshold) return '#f44336'; // Vermelho
    return '#ff9800'; // Laranja
  }

  refresh(): void {
    this.loading = true;
    this.loadDashboardData();
  }
}

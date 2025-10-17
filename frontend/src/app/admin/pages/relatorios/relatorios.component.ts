import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
// import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import Chart from 'chart.js/auto';
import type { ChartConfiguration } from 'chart.js';

import {
  ReportService,
  ReportFilters,
  SalesReport,
  StockReport,
  CustomerReport,
  EmployeeReport
} from '../../services/report.service';
import { CategoryService } from '../../services/category.service';
import { UserService } from '../../services/user.service';

// Usando chart.js/auto, não é necessário registrar manualmente

@Component({
  selector: 'app-relatorios',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatListModule,
    MatSnackBarModule
  ],
  templateUrl: './relatorios.component.html',
  styleUrls: ['./relatorios.component.css']
})
export class RelatoriosComponent implements OnInit, OnDestroy {
  @ViewChild('salesChart') salesChartRef!: ElementRef;
  @ViewChild('stockChart') stockChartRef!: ElementRef;
  @ViewChild('customersChart') customersChartRef!: ElementRef;

  loading = true;
  filters: ReportFilters = {
    period: 'monthly',
    start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
    end_date: new Date().toISOString(),
    include_inactive: false
  };

  salesReport: SalesReport | null = null;
  stockReport: StockReport | null = null;
  customerReport: CustomerReport | null = null;
  employeeReport: EmployeeReport | null = null;

  categories: any[] = [];
  employees: any[] = [];

  private salesChart: any = null;
  private stockChart: any = null;
  private customersChart: any = null;
  private destroy$ = new Subject<void>();

  constructor(
    private reportService: ReportService,
    private categoryService: CategoryService,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadFiltersData();
    this.loadReports();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
    this.salesChart?.destroy();
    this.stockChart?.destroy();
    this.customersChart?.destroy();
  }

  private loadFiltersData(): void {
    forkJoin({
      categories: this.categoryService.getCategories(),
      employees: this.userService.getUsers({ type: 'employee' })
    }).subscribe({
      next: (data) => {
        this.categories = data.categories.data;
        this.employees = data.employees.data;
      },
      error: (error) => {
        console.error('Erro ao carregar dados dos filtros:', error);
      }
    });
  }

  loadReports(): void {
    this.loading = true;

    forkJoin({
      sales: this.reportService.getSalesReport(this.filters),
      stock: this.reportService.getStockReport(this.filters),
      customers: this.reportService.getCustomerReport(this.filters),
      employees: this.reportService.getEmployeeReport(this.filters)
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (data) => {
        this.salesReport = data.sales;
        this.stockReport = data.stock;
        this.customerReport = data.customers;
        this.employeeReport = data.employees;
        
        this.loading = false;
        // Garantir que o DOM renderize os canvases antes de montar os gráficos
        setTimeout(() => this.updateCharts());
      },
      error: (error) => {
        console.error('Erro ao carregar relatórios:', error);
        this.snackBar.open('Erro ao carregar relatórios', 'Fechar', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  private updateCharts(): void {
    console.log('Atualizando gráficos...');
    console.log('Sales Report:', this.salesReport);
    console.log('Stock Report:', this.stockReport);
    console.log('Customer Report:', this.customerReport);
    console.log('Stock movements:', this.stockReport?.stock_movements);
    console.log('New customers:', this.customerReport?.new_customers);
    
    // Render condicional e seguro por seção
    // Vendas
    if (this.salesReport && this.salesChartRef?.nativeElement) {
      const salesData = this.salesReport.sales_by_period || [];
      this.salesChart?.destroy();
      if (salesData.length > 0) {
        console.log('Criando gráfico de vendas com dados:', salesData);
        const cfg: ChartConfiguration<'line'> = {
          type: 'line',
          data: {
            labels: salesData.map(d => this.formatDate(d.date)),
            datasets: [
              {
                label: 'Vendas',
                data: salesData.map(d => d.sales),
                borderColor: '#4caf50',
                backgroundColor: 'rgba(76,175,80,0.2)',
                tension: 0.3
              },
              {
                label: 'Receita',
                data: salesData.map(d => d.revenue),
                borderColor: '#2196f3',
                backgroundColor: 'rgba(33,150,243,0.2)',
                tension: 0.3
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: { display: true, text: 'Vendas e Receita por Período' },
              legend: { display: true }
            },
            scales: { x: { ticks: { autoSkip: true, maxTicksLimit: 10 } } }
          }
        };
        this.salesChart = new Chart(this.salesChartRef.nativeElement, cfg);
      } else {
        console.log('Dados de vendas insuficientes - mostrando mensagem de "sem dados"');
      }
    }

    // Clientes
    if (this.customerReport && this.customersChartRef?.nativeElement) {
      const customerData = this.customerReport.new_customers || [];
      this.customersChart?.destroy();
      if (customerData.length > 0) {
        console.log('Criando gráfico de clientes com dados:', customerData);
        const cfg: ChartConfiguration<'bar'> = {
          type: 'bar',
          data: {
            labels: customerData.map(d => this.formatDate(d.date)),
            datasets: [{ label: 'Novos Clientes', data: customerData.map(d => d.count), backgroundColor: '#ff9800' }]
          },
          options: { responsive: true, maintainAspectRatio: false }
        };
        this.customersChart = new Chart(this.customersChartRef.nativeElement, cfg);
      } else {
        console.log('Dados de clientes insuficientes - mostrando mensagem de "sem dados"');
      }
    }

    // Estoque
    if (this.stockReport && this.stockChartRef?.nativeElement) {
      const stockData = this.stockReport.stock_movements || [];
      this.stockChart?.destroy();
      if (stockData.length > 0) {
        console.log('Criando gráfico de estoque com dados:', stockData);
        const cfg: ChartConfiguration<'bar'> = {
          type: 'bar',
          data: {
            labels: stockData.map(d => this.formatDate(d.date)),
            datasets: [
              { label: 'Entradas', data: stockData.filter(d => d.type === 'in').map(d => d.value), backgroundColor: '#4caf50' },
              { label: 'Saídas', data: stockData.filter(d => d.type === 'out').map(d => d.value), backgroundColor: '#f44336' }
            ]
          },
          options: { responsive: true, maintainAspectRatio: false }
        };
        this.stockChart = new Chart(this.stockChartRef.nativeElement, cfg);
      } else {
        console.log('Dados de estoque insuficientes - mostrando mensagem de "sem dados"');
      }
    }
  }

  exportReport(type: string, format: 'pdf' | 'xlsx' | 'csv'): void {
    this.reportService.exportReport({
      ...this.filters,
      report_type: type as any,
      format
    }).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        const date = new Date().toISOString().split('T')[0];
        link.href = url;
        link.download = `relatorio_${type}_${date}.${format}`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Erro ao exportar relatório:', error);
        this.snackBar.open('Erro ao exportar relatório', 'Fechar', { duration: 3000 });
      }
    });
  }

  formatCurrency(value: number | undefined): string {
    if (value === undefined) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  formatPercent(value: number | undefined): string {
    if (value === undefined) return '0%';
    return new Intl.NumberFormat('pt-BR', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(value / 100);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: '2-digit'
    });
  }
}

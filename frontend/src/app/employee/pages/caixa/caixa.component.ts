import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

import { CashService } from '../../services/cash.service';
import { StockService } from '../../../core/services/stock.service';
import { OrderService, PaymentMethod, CreateOrderRequest, CreateOrderResponse, Product } from '../../services/order.service';
import { CashStatus } from '../../models/cash.model';
import { OpenCashDialogComponent } from './dialogs/open-cash-dialog.component';

interface CartItem {
  product: Product;
  quantity: number;
  subtotal: number;
}

@Component({
  selector: 'app-caixa',
  templateUrl: './caixa.component.html',
  styleUrls: ['./caixa.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatDialogModule,
    MatSnackBarModule,
    MatAutocompleteModule,
    MatChipsModule,
    MatBadgeModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDividerModule
  ]
})
export class CaixaComponent implements OnInit, OnDestroy {
  // Status do Caixa
  cashStatus: CashStatus | null = null;
  loading = true;

  // Carrinho
  cartItems: CartItem[] = [];
  total = 0;

  // Busca de Produtos
  searchTerm = '';
  searchResults: Product[] = [];
  selectedProduct: Product | null = null;
  quantity = 1;

  // Cliente
  customerName = '';
  customerPhone = '';

  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  constructor(
    private cashService: CashService,
    private stockService: StockService,
    private orderService: OrderService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    // Configurar busca com debounce
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(term => {
      if (term) {
        this.searchProducts(term);
      } else {
        this.searchResults = [];
      }
    });
  }

  ngOnInit(): void {
    this.loadCashStatus();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCashStatus(): void {
    this.cashService.getStatus()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: status => {
          this.cashStatus = status;
          this.loading = false;
        },
        error: error => {
          console.error('Erro ao carregar status do caixa:', error);
          this.snackBar.open('Erro ao carregar status do caixa', 'Fechar', { duration: 3000 });
          this.loading = false;
        }
      });
  }

  openCash(): void {
    const dialogRef = this.dialog.open(OpenCashDialogComponent, {
      width: '360px'
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result?: { initialAmount: number }) => {
        if (!result || result.initialAmount === undefined) {
          return;
        }

        this.loading = true;
        this.cashService.openCash(result.initialAmount)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: status => {
              this.cashStatus = status;
              this.loading = false;
              this.snackBar.open('Caixa aberto com sucesso', 'Fechar', { duration: 3000 });
            },
            error: error => {
              console.error('Erro ao abrir caixa:', error);
              this.loading = false;
              this.snackBar.open('Erro ao abrir caixa', 'Fechar', { duration: 3000 });
            }
          });
      });
  }

  onSearch(event: any): void {
    this.searchSubject.next(event.target.value);
  }

  searchProducts(term: string): void {
    this.stockService.getStock({ search: term })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: response => {
          this.searchResults = response.data.filter(p => p.stock_quantity > 0);
        },
        error: error => {
          console.error('Erro ao buscar produtos:', error);
          this.snackBar.open('Erro ao buscar produtos', 'Fechar', { duration: 3000 });
        }
      });
  }

  selectProduct(product: Product): void {
    this.selectedProduct = product;
    this.quantity = 1;
    this.searchTerm = '';
    this.searchResults = [];
  }

  addToCart(): void {
    if (!this.selectedProduct || this.quantity < 1) return;

    const existingItem = this.cartItems.find(item => item.product.id === this.selectedProduct!.id);

    if (existingItem) {
      const newQuantity = existingItem.quantity + this.quantity;
      if (newQuantity > this.selectedProduct.stock_quantity) {
        this.snackBar.open('Quantidade excede o estoque disponível', 'Fechar', { duration: 3000 });
        return;
      }
      existingItem.quantity = newQuantity;
      existingItem.subtotal = newQuantity * this.selectedProduct.price;
    } else {
      if (this.quantity > this.selectedProduct.stock_quantity) {
        this.snackBar.open('Quantidade excede o estoque disponível', 'Fechar', { duration: 3000 });
        return;
      }
      this.cartItems.push({
        product: this.selectedProduct,
        quantity: this.quantity,
        subtotal: this.quantity * this.selectedProduct.price
      });
    }

    this.updateTotal();
    this.selectedProduct = null;
    this.quantity = 1;
  }

  removeFromCart(index: number): void {
    this.cartItems.splice(index, 1);
    this.updateTotal();
  }

  updateQuantity(index: number, change: number): void {
    const item = this.cartItems[index];
    const newQuantity = item.quantity + change;

    if (newQuantity < 1 || newQuantity > item.product.stock_quantity) {
      return;
    }

    item.quantity = newQuantity;
    item.subtotal = newQuantity * item.product.price;
    this.updateTotal();
  }

  updateTotal(): void {
    this.total = this.cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  }

  clearCart(): void {
    this.cartItems = [];
    this.total = 0;
    this.customerName = '';
    this.customerPhone = '';
  }

  finalizeSale(paymentMethod: PaymentMethod): void {
    if (!this.cartItems.length) {
      this.snackBar.open('Adicione produtos ao carrinho', 'Fechar', { duration: 3000 });
      return;
    }

    const order: CreateOrderRequest = {
      items: this.cartItems.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.product.price
      })),
      total: this.total,
      payment_method: paymentMethod,
      customer_name: this.customerName || undefined,
      customer_phone: this.customerPhone || undefined
    };

    this.orderService.createOrder(order)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: CreateOrderResponse) => {
          this.snackBar.open('Venda realizada com sucesso', 'Fechar', { duration: 3000 });
          this.clearCart();
          this.printReceipt(response);
        },
        error: (error: Error) => {
          console.error('Erro ao finalizar venda:', error);
          this.snackBar.open(error.message || 'Erro ao finalizar venda', 'Fechar', { duration: 3000 });
        }
      });
  }

  printReceipt(order: CreateOrderResponse): void {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Comprovante de Venda #${order.order_number}</title>
            <style>
              body { font-family: monospace; padding: 20px; }
              .header { text-align: center; margin-bottom: 20px; }
              .items { margin: 20px 0; }
              .item { margin: 5px 0; }
              .total { text-align: right; font-weight: bold; margin-top: 20px; }
              .footer { margin-top: 20px; text-align: center; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>ADEGA GS</h1>
              <p>Comprovante de Venda #${order.order_number}</p>
              <p>${new Date().toLocaleString()}</p>
            </div>
            ${order.customer_name ? `<p>Cliente: ${order.customer_name}</p>` : ''}
            ${order.customer_phone ? `<p>Telefone: ${order.customer_phone}</p>` : ''}
            <div class="items">
              ${order.items.map(item => `
                <div class="item">
                  ${item.quantity}x ${item.product.name}
                  <span style="float: right">R$ ${(item.subtotal || 0).toFixed(2)}</span>
                </div>
              `).join('')}
            </div>
            <div class="total">
              Total: R$ ${order.total.toFixed(2)}
            </div>
            <div class="footer">
              <p>Forma de pagamento: ${order.payment_method}</p>
              <p>Agradecemos a preferência!</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }
}
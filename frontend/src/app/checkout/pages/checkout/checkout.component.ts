import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { OrderService } from '../../../core/services/order.service';
import { CepService } from '../../../core/services/cep.service';
import { CartItem } from '../../../core/models/cart.model';
import { User } from '../../../core/models/auth.model';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatProgressSpinnerModule,
    MatIconModule
  ]
})
export class CheckoutComponent implements OnInit {
  deliveryForm: FormGroup;
  paymentForm: FormGroup;
  cartItems$!: Observable<CartItem[]>;
  cartTotal$!: Observable<number>;
  user$!: Observable<User | null>;
  loading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private authService: AuthService,
    private orderService: OrderService,
    private cepService: CepService,
    private router: Router
  ) {
    this.deliveryForm = this.fb.group({
      address: ['', Validators.required],
      number: ['', Validators.required],
      complement: [''],
      neighborhood: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zipcode: ['', [Validators.required, Validators.pattern(/^\d{5}-\d{3}$/)]],
      phone: ['', [Validators.required, Validators.pattern(/^\(\d{2}\) \d{5}-\d{4}$/)]],
      instructions: ['']
    });

    this.paymentForm = this.fb.group({
      method: ['pix', Validators.required],
      change: ['']
    });
  }

  ngOnInit(): void {
    // Inicializar observables
    this.cartItems$ = this.cartService.cartItems$;
    this.cartTotal$ = this.cartItems$.pipe(
      map((items: CartItem[]) => items.reduce((total: number, item: CartItem) => total + (item.quantity * item.price), 0))
    );
    this.user$ = this.authService.user$;

    // Preencher formulário com dados do usuário
    this.user$.subscribe((user: User | null) => {
      if (user) {
        this.deliveryForm.patchValue({
          phone: user.phone
        });
      }
    });
  }

  formatPhone(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
      value = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
      this.deliveryForm.get('phone')?.setValue(value, { emitEvent: false });
    }
  }

  formatZipcode(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length <= 8) {
      value = value.replace(/^(\d{5})(\d{3}).*/, '$1-$2');
      this.deliveryForm.get('zipcode')?.setValue(value, { emitEvent: false });
    }
  }

  /**
   * Busca endereço pelo CEP
   */
  searchCep(): void {
    const zipcode = this.deliveryForm.get('zipcode')?.value;
    
    if (!zipcode || !this.cepService.isValidCep(zipcode)) {
      return;
    }

    this.loading = true;
    
    this.cepService.searchCep(zipcode).subscribe({
      next: (cepData) => {
        // Preenche automaticamente os campos do endereço
        this.deliveryForm.patchValue({
          address: cepData.street,
          neighborhood: cepData.neighborhood,
          city: cepData.city,
          state: cepData.state
        });
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao buscar CEP:', error);
        this.error = error.message || 'Erro ao buscar CEP';
        this.loading = false;
      }
    });
  }

  /**
   * Limpa erro quando o usuário começa a digitar
   */
  clearError(): void {
    this.error = null;
  }

  async onSubmit(): Promise<void> {
    if (this.deliveryForm.invalid || this.paymentForm.invalid) {
      this.error = 'Por favor, preencha todos os campos obrigatórios';
      return;
    }

    this.loading = true;
    this.error = null;

    try {
      // Buscar os itens do carrinho
      const items = await new Promise<CartItem[]>((resolve) => {
        this.cartItems$.subscribe(items => {
          resolve(items);
        }).unsubscribe();
      });

      if (items.length === 0) {
        this.error = 'Seu carrinho está vazio';
        this.loading = false;
        return;
      }

      // Mapear método de pagamento para o formato esperado pelo backend
      const paymentMethodMap: { [key: string]: string } = {
        'pix': 'pix',
        'cash': 'dinheiro',
        'card': 'cartão de débito'
      };

      // Preparar dados do pedido
      const orderData = {
        type: 'online',
        delivery: this.deliveryForm.value,
        payment_method: paymentMethodMap[this.paymentForm.value.method] || 'pix',
        customer_name: this.deliveryForm.value.address,
        customer_phone: this.deliveryForm.value.phone,
        items: items.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity
        }))
      };

      console.log('Enviando pedido:', orderData);

      // Enviar pedido para o backend
      this.orderService.createOrder(orderData).subscribe({
        next: (response) => {
          console.log('Pedido criado com sucesso:', response);
          this.loading = false;

          // Limpar o carrinho
          this.cartService.clearCart();

          // Redirecionar baseado no método de pagamento
          const paymentMethod = this.paymentForm.value.method;
          
          if (paymentMethod === 'pix') {
            // TODO: Mostrar página com QR Code do PIX
            alert(`Pedido #${response.order_number} criado com sucesso!\n\nPagamento via PIX.\nTotal: R$ ${response.total_amount || response.total}`);
            this.router.navigate(['/pedidos']);
          } else if (paymentMethod === 'cash') {
            // Dinheiro na entrega
            alert(`Pedido #${response.order_number} criado com sucesso!\n\nPagamento em dinheiro na entrega.\nTotal: R$ ${response.total_amount || response.total}`);
            this.router.navigate(['/pedidos']);
          } else if (paymentMethod === 'card') {
            // Cartão na entrega
            alert(`Pedido #${response.order_number} criado com sucesso!\n\nPagamento com cartão na entrega.\nTotal: R$ ${response.total_amount || response.total}`);
            this.router.navigate(['/pedidos']);
          }
        },
        error: (error) => {
          console.error('Erro ao criar pedido:', error);
          this.error = error.error?.message || 'Erro ao finalizar pedido. Tente novamente.';
          this.loading = false;
        }
      });

    } catch (error) {
      console.error('Erro ao processar pedido:', error);
      this.error = 'Erro ao processar pedido. Tente novamente.';
      this.loading = false;
    }
  }
}

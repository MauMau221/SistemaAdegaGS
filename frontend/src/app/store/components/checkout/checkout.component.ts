import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../core/services/cart.service';
import { OrderService } from '../../../core/services/order.service';
import { PaymentService } from '../../../core/services/payment.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class CheckoutComponent implements OnInit {
  checkoutForm: FormGroup;
  loading = false;
  paymentMethod: 'pix' | 'credit_card' | 'local' = 'pix';
  pixQrCode: string | null = null;
  
  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private orderService: OrderService,
    private paymentService: PaymentService,
    private router: Router
  ) {
    this.checkoutForm = this.fb.group({
      delivery_address: ['', Validators.required],
      notes: [''],
      payment_method: ['pix', Validators.required],
      card_number: [''],
      card_holder: [''],
      card_expiry: [''],
      card_cvv: ['']
    });
  }

  get cartItems$() {
    return this.cartService.cartItems$;
  }

  ngOnInit(): void {
    this.checkoutForm.get('payment_method')?.valueChanges.subscribe(method => {
      this.paymentMethod = method;
      this.updateCardValidators();
    });
  }

  private updateCardValidators(): void {
    const cardFields = ['card_number', 'card_holder', 'card_expiry', 'card_cvv'];
    
    cardFields.forEach(field => {
      const control = this.checkoutForm.get(field);
      if (this.paymentMethod === 'credit_card') {
        control?.setValidators([Validators.required]);
      } else {
        control?.clearValidators();
      }
      control?.updateValueAndValidity();
    });
  }

  async onSubmit(): Promise<void> {
    if (this.checkoutForm.invalid) return;

    this.loading = true;

    try {
      // Obter itens do carrinho
      const cartItems = await firstValueFrom(this.cartItems$);
      
      // Criar pedido
      const orderData = {
        items: cartItems.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity
        })),
        total_amount: this.cartService.getTotal(),
        type: 'online',
        notes: this.checkoutForm.get('notes')?.value
      };

      const order = await firstValueFrom(this.orderService.createOrder(orderData));

      if (order) {
        // Processar pagamento
        if (this.paymentMethod === 'pix') {
          const pixData = await firstValueFrom(this.paymentService.gerarPix(order.id));
          this.pixQrCode = pixData.qr_code_base64;
          
        } else if (this.paymentMethod === 'credit_card') {
          const cardData = {
            token: 'TOKEN_DO_CARTAO', // Implementar tokenização
            installments: 1,
            payment_method_id: 'credit_card'
          };
          
          await firstValueFrom(this.paymentService.pagarCartao(order.id, cardData));
          this.router.navigate(['/loja/pedido', order.id]);
          
        } else {
          // Pagamento local
          this.router.navigate(['/loja/pedido', order.id]);
        }

        // Limpar carrinho após sucesso
        this.cartService.clearCart();
      }

    } catch (error) {
      console.error('Erro ao processar pedido:', error);
      // Implementar tratamento de erro
    } finally {
      this.loading = false;
    }
  }

  getTotal(): number {
    return this.cartService.getTotal();
  }
}
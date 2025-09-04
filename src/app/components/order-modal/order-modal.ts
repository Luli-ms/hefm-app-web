import { Component, computed, EventEmitter, inject, Output, Signal } from '@angular/core';
import { OrderService } from '../../services/order.service';
import { CartService } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { FormatInterface } from '../../models/format.interface';
import { ProductInterface } from '../../models/product.interface';
import { CartInterface } from '../../models/cart.interface';

@Component({
  selector: 'app-order-modal',
  imports: [RouterModule, CommonModule],
  templateUrl: './order-modal.html',
  styleUrl: './order-modal.css'
})
export class OrderModal {
  @Output() close = new EventEmitter<void>();
  min = 50;

  orderService = inject(OrderService);
  cartService = inject(CartService);
  productService = inject(ProductService);
  authService = inject(AuthService);

  totalWithIGIC = this.orderService.totalWithIGIC;

  isSubmitEnabled: Signal<boolean> = computed<boolean>(() => {
    return this.orderService.totalWithIGIC >= this.min && this.authService.currUserSign() != null
  });

  isPedidoFinalizado: boolean = false;

  errorMessageSignal = computed<string | null>(() => {
    if (!this.authService.currUserSign()) {
      return `Debe iniciar sesión para hacer el pedido`;
    }

    if (this.totalWithIGIC < this.min) {
      return `El pedido debe ser de al menos ${this.min} €`;
    }

    return null
  })

  closeModal() {
    this.close.emit();
  }

  setCategoria(cat: string | null) {
    this.productService.setCat(cat);
    this.closeModal();
  }

  async onSubmit() {
    const orderId = await this.orderService.generateConsecutiveId();
    const total = this.totalWithIGIC;
    const name = this.authService.currUserSign()!.name;
    const email = this.authService.currUserSign()!.email;
    const order = this.cartService.cart();

    this.orderService.sendOrder({ orderId, total, name, email, order }); /*orderId,*/

    this.isPedidoFinalizado = true;
  }

  getImporteTotal(format: FormatInterface, cartItem: CartInterface, item: ProductInterface): number {
    return this.orderService.getSubtotal(format, cartItem, item);
  }
}

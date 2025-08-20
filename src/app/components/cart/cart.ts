import { AfterViewInit, Component, computed, inject, NgZone } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductInterface } from '../../models/product.interface';
import { FormatInterface } from '../../models/format.interface';
import { OrderService } from '../../services/order.service';
import { ProductService } from '../../services/product.service';
import { AuthService } from '../../services/auth.service';
import { OrderModal } from '../order-modal/order-modal';
import { FormsModule } from "@angular/forms";
import { CartInterface } from '../../models/cart.interface';

@Component({
  selector: 'app-cart',
  imports: [RouterModule, CommonModule, OrderModal, FormsModule],
  templateUrl: './cart.html',
  styleUrl: './cart.css'
})
export class Cart {
  cartService = inject(CartService);
  orderService = inject(OrderService);
  productService = inject(ProductService);

  showSum: boolean = false;

  cart = computed(() => {
    const cartItems = this.cartService.cart();
    return cartItems.map(item => {
      const formatActualizado = this.productService.getFormatWithPrecio(item.prod.id, item.format.formatId);
      return {
        ...item,
        format: formatActualizado ?? item.format
      };
    });
  });

  updateQty(format: FormatInterface, prod: ProductInterface, value: Event) {
    const input = value.target as HTMLInputElement;
    const qty = Number((value.target as HTMLInputElement).value);

    if (isNaN(qty) || qty < 1) {
      this.cartService.removeItem(prod, format)
    } else {
      this.cartService.setQty(format, Math.floor(qty)); // sin decimales
    }

    input.blur();
  }

  changeQty(format: FormatInterface, qty: number) {
    this.cartService.addQty(format, qty);
  }

  isMinusDisabled(cantidad: number) {
    return cantidad <= 1;
  }

  removeItem(prod: ProductInterface, format: FormatInterface) {
    this.cartService.removeItem(prod, format);
  }

  setCategoria(cat: string | null) {
    this.productService.setCat(cat);
  }
}

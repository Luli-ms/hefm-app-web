import { computed, effect, inject, Injectable, signal, Signal } from '@angular/core';
import { CartService } from './cart.service';
import { CartInterface } from '../models/cart.interface';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  cartService = inject(CartService);

  private cart: Signal<CartInterface[]> = this.cartService.cart;

  private totalPrice: Signal<number> = computed(() => {
    return this.cart().reduce((acc, item) => {
      const price = item.format.price.lvl1 ?? 0;
      return acc + price * item.cantidad;
    }, 0);
  });

  get total() {
    return this.totalPrice;
  }
}

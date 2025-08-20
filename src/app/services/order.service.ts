import { computed, inject, Injectable, Signal } from '@angular/core';
import { CartService } from './cart.service';
import { CartInterface } from '../models/cart.interface';
import { HttpClient } from '@angular/common/http';
import emailjs from '@emailjs/browser';
import { IGIC, ProductInterface } from '../models/product.interface';
import { FormatInterface } from '../models/format.interface';


@Injectable({
  providedIn: 'root'
})
export class OrderService {
  cartService = inject(CartService);

  private http = inject(HttpClient);
  private API_URL = 'https://sendorderemail-uk5msfuoua-uc.a.run.app';

  private cart: Signal<CartInterface[]> = this.cartService.cart;

  sendOrder(order: { total: number; name: string; email: string; order: CartInterface[] }) {
    if (order.total < 50) {
      console.error('El pedido debe ser de al menos 50€');
      return;
    }

    const payload = {
      total: order.total,
      name: order.name,
      email: order.email,
      orderDetails: order.order,
    };

    this.http.post(this.API_URL, payload).subscribe({
      next: (res) => {
        console.log('Enviado correo de pedido y confirmación', res);
        this.cartService.resetCart();
      },
      error: (err) => console.error('Error en la validación del pedido', err)
    });

  }

  private totalPriceWithIGIC = computed(() => {
    const total = this.cart().reduce((acc, item) => {
      return acc + this.getSubtotal(item.format, item, item.prod);
    }, 0);

    return Math.round(total * 100) / 100;
  });

  get totalWithIGIC() {
    return this.totalPriceWithIGIC();
  }

  getIgicRate(item: ProductInterface): number {
    const key = item.igic as keyof typeof IGIC;

    return IGIC[key];
  }


  getSubtotal(format: FormatInterface, cartItem: CartInterface, item: ProductInterface): number {
    return Math.round((format.precioFinal * cartItem.cantidad * (1 + this.getIgicRate(item))) * 100) / 100;
  }
}

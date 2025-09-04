import { computed, inject, Injectable, Signal } from '@angular/core';
import { CartService } from './cart.service';
import { CartInterface } from '../models/cart.interface';
import { HttpClient } from '@angular/common/http';
import { IGIC, ProductInterface } from '../models/product.interface';
import { FormatInterface } from '../models/format.interface';
import { Firestore } from '@angular/fire/firestore';
import { doc, runTransaction, serverTimestamp, setDoc } from 'firebase/firestore';
import { OrderInterface } from '../models/order.interface';


@Injectable({
  providedIn: 'root'
})
export class OrderService {
  cartService = inject(CartService);

  private http = inject(HttpClient);
  private API_URL = 'https://sendorderemail-uk5msfuoua-uc.a.run.app';
  private db = inject(Firestore);

  private cart: Signal<CartInterface[]> = this.cartService.cart;


  async generateConsecutiveId() {
    const year = new Date().getFullYear().toString().slice(-2);
    console.log("Año:", year);

    // Referencia al documento del contador
    const counterRef = doc(this.db, 'counter', year);
    console.log(counterRef)

    // Transacción para leer, incrementar y guardar
    const newNumber = await runTransaction(this.db, async (t) => {
      const docSnap = await t.get(counterRef);
      let lastNumber = 0;

      if (docSnap.exists()) {
        lastNumber = docSnap.data()['lastNumber'] || 0;
      }

      const nextNumber = lastNumber + 1;
      t.set(counterRef, { lastNumber: nextNumber }, { merge: true });
      console.log("Documento actualizado en la transacción:", nextNumber);

      return nextNumber;
    });

    const formattedNumber = String(newNumber).padStart(3, '0');
    const consecutiveId = `${year}${formattedNumber}`;
    console.log("ID consecutivo generado:", consecutiveId);

    return consecutiveId;
  }

  async sendOrder(order: OrderInterface) {
    if (order.total < 50) {
      console.error('El pedido debe ser de al menos 50€');
      return;
    }



    console.log('Pedido guardado en Firestore con ID:', order.orderId);

    const payload = {
      orderId: order.orderId,
      total: order.total,
      name: order.name,
      email: order.email,
      orderDetails: order.order,
    };

    const orderRef = doc(this.db, 'orders', order.orderId);

    await setDoc(orderRef, {
      payload,
      createdAt: serverTimestamp()
    });

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

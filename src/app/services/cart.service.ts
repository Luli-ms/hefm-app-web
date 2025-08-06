import { Injectable, Signal, signal } from '@angular/core';
import { CartInterface } from '../models/cart.interface';
import { ProductInterface } from '../models/product.interface';
import { FormatInterface } from '../models/format.interface';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cartSignal = signal<CartInterface[]>([]);

  get cart(): Signal<CartInterface[]> {
    return this.cartSignal;
  }

  addToCart(prod: ProductInterface, format: FormatInterface, cantidad: number = 1): void {
    this.cartSignal.update(items => {
      const updated = [...items];
      const idx = updated.findIndex(item =>
        item.prod.id === prod.id && item.format.formatId === format.formatId
      );

      if (idx === -1) {
        updated.push({ prod, format, cantidad });
      } else {
        const existing = updated[idx];
        updated[idx] = {
          ...existing,
          cantidad: Math.max(0, existing.cantidad + cantidad) // si quieres permitir 0, o usa Math.max(1, ...) si no
        };
      }

      return updated;
    });
  }

  addQty(prod: ProductInterface, format: FormatInterface, qty: number) {
    this.cartSignal.update(cart => {
      const updated = [...cart];
      const idx = updated.findIndex(item =>
        item.prod!.id === prod.id && item.format === format
      );

      if (idx !== -1) {
        updated[idx] = {
          ...updated[idx],
          cantidad: Math.max(1, updated[idx].cantidad + qty)
        }
      }
      return updated;
    })
  }

  removeItem(prod: ProductInterface, format: FormatInterface): void {
    this.cartSignal.update(items =>
      items.filter(item =>
        !(item.prod!.id === prod.id &&
          item.format.formatId == format.formatId)
      )
    );
  }
}


import { Component, computed, effect, inject } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductInterface } from '../../models/product.interface';
import { FormatInterface } from '../../models/format.interface';
import { OrderService } from '../../services/order.service';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-cart',
  imports: [RouterModule, CommonModule],
  templateUrl: './cart.html',
  styleUrl: './cart.css'
})
export class Cart {
  cartService = inject(CartService);
  orderService = inject(OrderService);
  productService = inject(ProductService);

  cart = this.cartService.cart;

  changeQty(prod: ProductInterface, format: FormatInterface, qty: number) {
    this.cartService.addQty(prod, format, qty);
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

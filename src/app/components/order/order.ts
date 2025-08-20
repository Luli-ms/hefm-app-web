import { Component, inject } from '@angular/core';
import { OrderService } from '../../services/order.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';
import { OrderModal } from '../order-modal/order-modal';

@Component({
  selector: 'app-order',
  imports: [CommonModule, RouterModule, OrderModal],
  templateUrl: './order.html',
  styleUrl: './order.css'
})
export class Order {
  orderService = inject(OrderService);
  cartService = inject(CartService);
  productService = inject(ProductService)

  showSum: boolean = false;
}

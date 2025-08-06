import { Component, inject } from '@angular/core';
import { OrderService } from '../../services/order.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-order',
  imports: [CommonModule, RouterModule],
  templateUrl: './order.html',
  styleUrl: './order.css'
})
export class Order {
  orderService = inject(OrderService);
  cartService = inject(CartService);

  showSum: boolean = false;

  closeModal() {
    this.showSum = false;
  }
}

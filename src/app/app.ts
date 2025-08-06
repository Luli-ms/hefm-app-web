import { CommonModule } from '@angular/common';
import { Header } from './components/header/header';
import { RouterOutlet } from '@angular/router';
import { Prueba } from './prueba';
import { ProductService } from './services/product.service';
import { Component, inject } from '@angular/core';
import { Footer } from './components/footer/footer';
import { Order } from './components/order/order';

@Component({
  selector: 'app-root',
  imports: [CommonModule, Header, RouterOutlet, Footer, Order],
  templateUrl: './app.html',
  styleUrl: './app.css'
})

export class App {
  pruebaService = inject(Prueba);
  productService = inject(ProductService);

  constructor() {
    this.pruebaService.testAuth()
  }
}

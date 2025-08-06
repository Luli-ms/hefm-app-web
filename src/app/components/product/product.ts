import { Component, computed, effect, EventEmitter, inject, input, Output, signal } from '@angular/core';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';
import { ProductInterface } from '../../models/product.interface';
import { FormatInterface } from '../../models/format.interface';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-product',
  imports: [CommonModule],
  templateUrl: './product.html',
  styleUrl: './product.css'
})
export class Product {

}
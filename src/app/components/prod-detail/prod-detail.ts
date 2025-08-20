import { Component, computed, effect, inject, OnInit, Signal, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatestWith, defaultIfEmpty, map, Observable, of, switchMap } from 'rxjs';
import { ProductService } from '../../services/product.service';
import { ProductInterface } from '../../models/product.interface';
import { CommonModule } from '@angular/common';
import { FormatInterface } from '../../models/format.interface';
import { toSignal } from '@angular/core/rxjs-interop';
import { CartService } from '../../services/cart.service';
import { Catalog } from '../catalog/catalog';

@Component({
  selector: 'app-prod-detail',
  imports: [CommonModule],
  templateUrl: './prod-detail.html',
  styleUrl: './prod-detail.css',
  standalone: true
})
export class ProdDetail {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private cartService = inject(CartService);

  id$ = this.route.paramMap.pipe(map(param => param.get('id')));
  formatId$ = this.route.queryParamMap.pipe(map(param => param.get('formatId')));

  idSignal = toSignal(this.id$);
  formatIdSignal = toSignal(this.formatId$);

  selectedProd: Signal<ProductInterface | null> = this.productService.getProdById(this.idSignal());

  formats = computed(() => this.selectedProd()?.format ?? []);

  selectedFormat: Signal<FormatInterface | undefined> = computed(() => {
    const producto = this.selectedProd();
    const formatId = this.formatIdSignal();

    if (!producto || !formatId) return undefined;
    return producto.format.find(f => f.formatId === formatId);
  });

  addToCart(prod: ProductInterface, format: FormatInterface) {
    this.cartService.addToCart(prod, format);
  }
}

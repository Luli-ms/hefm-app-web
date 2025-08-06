import { Component, inject, OnChanges, OnInit, Signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryEnum } from '../../models/category.enum';
import { GroupedInterface } from '../../models/grouped.interface';
import { Observable, Subject, takeUntil } from 'rxjs';
import { ProductInterface } from '../../models/product.interface';
import { FormatInterface } from '../../models/format.interface';
import { CartService } from '../../services/cart.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-catalog',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './catalog.html',
  styleUrl: './catalog.css'
})
export class Catalog {
  productService = inject(ProductService);
  cartService = inject(CartService);

  categorias = Object.entries(CategoryEnum).map(([key, value]) => ({
    key,
    value
  }));

  searchTerm = '';
  umFilter: string | null = this.productService.um();
  catFilter: Signal<string | null> = this.productService.categoria;
  groupedProds: Signal<GroupedInterface[] | null> = this.productService.groupedProds;

  constructor() {
    this.productService.setUm(this.umFilter);
  }

  setSearchTerm() {
    this.productService.setSearchTerm(this.searchTerm);
  }

  onCategoriaChange(event: Event) {
    const cat = (event.target as HTMLSelectElement).value;

    this.productService.setCat(cat);
  }

  onUmChange() {
    if (this.umFilter !== '') {
      this.productService.setUm(this.umFilter);
    } else {
      this.productService.setUm(null);
    }
  }

  onGroupChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value as 'category' | 'brand';
    this.productService.setGroupBy(value);
  }

  addToCart(prod: ProductInterface, format: FormatInterface, event: Event) {
    event.stopPropagation();

    this.cartService.addToCart(prod, format);
  }
}

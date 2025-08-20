import { Component, computed, inject, OnChanges, OnInit, Signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryEnum } from '../../models/category.enum';
import { GroupedInterface } from '../../models/grouped.interface';
import { ProductInterface } from '../../models/product.interface';
import { FormatInterface } from '../../models/format.interface';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { LvlEnum } from '../../models/lvl.enum';

@Component({
  selector: 'app-catalog',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './catalog.html',
  styleUrl: './catalog.css'
})
export class Catalog {
  productService = inject(ProductService);
  cartService = inject(CartService);
  authService = inject(AuthService)

  categorias = Object.entries(CategoryEnum).map(([key, value]) => ({
    key,
    value
  }));

  searchTerm = this.productService.searchTerm();
  catFilter: Signal<string | null> = this.productService.categoria;
  groupedProds: Signal<GroupedInterface[] | null> = this.productService.groupedProds;


  setSearchTerm() {
    this.productService.setSearchTerm(this.searchTerm);
  }

  onCategoriaChange(event: Event) {
    const cat = (event.target as HTMLSelectElement).value;

    this.productService.setCat(cat);
  }

  onGroupChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value as 'category' | 'brand';
    this.productService.setGroupBy(value);
  }

  addToCart(prod: ProductInterface, format: FormatInterface, event: Event) {
    event.stopPropagation();

    if (this.isDisponible(format)) {
      this.cartService.addToCart(prod, format);
    }
  }

  isDisponible(f: FormatInterface): boolean {
    return this.productService.isDisponible(f);
  }

  hayDescuento(f: FormatInterface): boolean {
    const precioBase = f.price.lvl1;
    const precioUsuario = f.precioFinal ?? precioBase;
    return precioUsuario < precioBase;
  }
}

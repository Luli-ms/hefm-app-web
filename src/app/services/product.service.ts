import { computed, inject, Injectable, signal, Signal } from '@angular/core';
import { ImgService } from './img.service';
import { BehaviorSubject, combineLatest, map, Observable, of } from 'rxjs';
import { ProductInterface } from '../models/product.interface';
import { GroupedInterface } from '../models/grouped.interface';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from './auth.service';
import { LvlEnum } from '../models/lvl.enum';
import { FormatInterface } from '../models/format.interface';

@Injectable({
  providedIn: 'root'
})

export class ProductService {
  private imgService = inject(ImgService);
  private authService = inject(AuthService);

  // Observable with resolved imgs prods
  private prods$: Observable<ProductInterface[]> = this.imgService.getProdsWithImg();

  // BehaviorSubjects for filters
  private searchTerm$ = new BehaviorSubject<string>('');
  private categoria$ = new BehaviorSubject<string | null>(null);
  private groupBy$ = new BehaviorSubject<'category' | 'brand'>('category');

  // Prods to signals to use in components
  private prodsSignal = toSignal(this.prods$, { initialValue: null });

  // BehaviorSubject filters to signals
  private searchTermSignal = toSignal(this.searchTerm$, { initialValue: '' });
  private categoriaSignal = toSignal(this.categoria$, { initialValue: null });
  private groupBySignal = toSignal(this.groupBy$, { initialValue: 'category' });

  // Group + Filter signal
  private groupedProdsSignal: Signal<GroupedInterface[] | null>;

  constructor() {
    this.groupedProdsSignal = computed(() => {
      const prods = this.prodsSignal();

      if (!prods) return null;

      const searchTerm = this.searchTermSignal();
      const categoria = this.categoriaSignal();
      const groupBy = this.groupBySignal();

      const filtered = prods!.filter(p =>
        (!categoria || p.category === categoria) &&
        (!searchTerm || p.prodName.toLowerCase().includes(searchTerm.toLowerCase()) || p.id.toLowerCase().includes(searchTerm.toLowerCase())))

      const grouped = filtered.reduce((acc, prod) => {
        const key = prod[groupBy];
        acc[key] = acc[key] || [];
        acc[key].push(prod);
        return acc;
      }, {} as Record<string, ProductInterface[]>);

      const keys = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

      return keys.map(key => ({
        group: key,
        prods: grouped[key].sort((a, b) => Number(a.id) - Number(b.id))
      }));
    });
  }

  // expose signals
  getProdById(id: string | null | undefined): Signal<ProductInterface | null> {
    return computed(() => this.prodsSignal()?.find(prod => prod.id === id) ?? null);
  }

  get groupedProds(): Signal<GroupedInterface[] | null> {
    return this.groupedProdsWithPrecio;
  }

  get searchTerm(): Signal<string> {
    return this.searchTermSignal;
  }

  get categoria(): Signal<string | null> {
    return this.categoriaSignal;
  }

  get groupBy(): Signal<'category' | 'brand'> {
    return this.groupBySignal;
  }

  // update filters
  setSearchTerm(term: string) {
    this.searchTerm$.next(term);
  }

  setCat(cat: string | null) {
    this.categoria$.next(cat);
  }

  setGroupBy(value: 'category' | 'brand') {
    this.groupBy$.next(value);
  }

  /*Precios*/
  private groupedProdsWithPrecio: Signal<GroupedInterface[] | null> =
    computed(() => {
      const grouped = this.groupedProdsSignal();
      if (!grouped) return null;

      // Mapeamos cada producto y sus formatos para añadir precioFinal según userLvl
      return grouped.map(group => ({
        group: group.group,
        prods: group.prods.map(prod => ({
          ...prod,
          format: prod.format.map(f => ({
            ...f,
            precioFinal: f.price[this.userLvl] ?? f.price.lvl1

          }))
        }))
      }));
    });

  getFormatWithPrecio(prodId: string, formatId: string): FormatInterface | null {
    const grouped = this.groupedProdsWithPrecio();
    if (!grouped) return null;

    for (const group of grouped) {
      for (const prod of group.prods) {
        if (prod.id === prodId) {
          const format = prod.format.find(f => f.formatId === formatId);
          if (format) {
            return format; // Ya incluye precioFinal calculado en productService
          }
        }
      }
    }
    return null;
  }

  get userLvl(): LvlEnum {
    return this.authService.currUserSign()?.lvlDescuento ?? LvlEnum.lvl1;
  }

  isDisponible(f: FormatInterface,): boolean {
    return f.precioFinal != null;
  }
}

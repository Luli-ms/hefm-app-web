import { computed, inject, Injectable, signal, Signal } from '@angular/core';
import { ImgService } from './img.service';
import { BehaviorSubject, combineLatest, map, Observable, of } from 'rxjs';
import { ProductInterface } from '../models/product.interface';
import { GroupedInterface } from '../models/grouped.interface';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';

@Injectable({
  providedIn: 'root'
})

export class ProductService {
  private imgService = inject(ImgService);

  // Observable with resolved imgs prods
  private prods$: Observable<ProductInterface[]> = this.imgService.getProdsWithImg();

  // BehaviorSubjects for filters
  private searchTerm$ = new BehaviorSubject<string>('');
  private um$ = new BehaviorSubject<string | null>('caja');
  private categoria$ = new BehaviorSubject<string | null>(null);
  private groupBy$ = new BehaviorSubject<'category' | 'brand'>('category');

  // Prods to signals to use in components
  private prodsSignal = toSignal(this.prods$, { initialValue: null });

  // BehaviorSubject filters to signals
  private searchTermSignal = toSignal(this.searchTerm$, { initialValue: '' });
  private umSignal = toSignal(this.um$, { initialValue: 'caja' });
  private categoriaSignal = toSignal(this.categoria$, { initialValue: null });
  private groupBySignal = toSignal(this.groupBy$, { initialValue: 'category' });

  // Group + Filter signal
  private groupedProdsSignal: Signal<GroupedInterface[] | null>;

  constructor() {
    this.groupedProdsSignal = computed(() => {
      const prods = this.prodsSignal();

      if (prods === null) return null;

      const searchTerm = this.searchTermSignal();
      const um = this.umSignal();
      const categoria = this.categoriaSignal();
      const groupBy = this.groupBySignal();

      const filtered = prods!.filter(p =>
        (!categoria || p.category === categoria) &&
        (!searchTerm || p.prodName.toLowerCase().includes(searchTerm.toLowerCase()) || p.id.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (!um || p.format.some(f => f.um === um))
      ).map(p => ({
        ...p,
        format: um ? p.format.filter(f => f.um === um) : p.format
      }));

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
    return this.groupedProdsSignal;
  }

  get searchTerm(): Signal<string> {
    return this.searchTermSignal;
  }

  get um(): Signal<string | null> {
    return this.umSignal;
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

  setUm(um: string | null) {
    this.um$.next(um);
  }

  setCat(cat: string | null) {
    this.categoria$.next(cat);
  }

  setGroupBy(value: 'category' | 'brand') {
    this.groupBy$.next(value);
  }
}

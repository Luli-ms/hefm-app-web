import { inject, Injectable } from '@angular/core';
import { from, Observable, of, catchError, forkJoin, map, switchMap, shareReplay, throwError } from 'rxjs';
import { Storage } from '@angular/fire/storage';
import { getDownloadURL, ref } from 'firebase/storage';
import { HttpClient } from '@angular/common/http';
import { ProductInterface } from '../models/product.interface';

@Injectable({
  providedIn: 'root'
})
export class ImgService {
  private storage = inject(Storage);
  private http = inject(HttpClient);
  private readonly url: string = "assets/data/prods.json";

  private imgUrlCache = new Map<string, Observable<string>>();
  private prodsCache$?: Observable<ProductInterface[]>

  private getImgs(path: string): Observable<string> {
    if (!path) {
      return of('assets/imgs/not_found.webp');
    }

    if (this.imgUrlCache.has(path)) {
      return this.imgUrlCache.get(path)!;
    }

    const reference = ref(this.storage, path);

    const url$ = from(getDownloadURL(reference)).pipe(
      shareReplay(1),
    );

    this.imgUrlCache.set(path, url$);
    return url$;
  }

  private getProds(): Observable<ProductInterface[]> {
    if (!this.prodsCache$) {
      this.prodsCache$ = this.http.get<ProductInterface[]>(this.url).pipe(
        shareReplay(1),
        catchError(err => {
          console.error('Error cargando productos', err);
          return of([]);
        })
      )
    }

    return this.prodsCache$;
  }


  getProdsWithImg(): Observable<ProductInterface[]> {
    return this.getProds().pipe(
      /*Replace (prods) array for prods with the real firebase storage URL*/
      switchMap((prods) =>
        forkJoin(
          prods.map((prod) =>
            forkJoin(
              prod.format.map((formato) =>
                this.getImgs(formato.img).pipe(
                  map((url) => ({
                    ...formato,
                    img: url,
                  })),
                )
              )
            ).pipe(
              map((formatWithUrls) => ({
                /*Replace the format field of the prod*/
                ...prod,
                format: formatWithUrls,
              }))
            )
          )
        )
      )
    )
  }
}

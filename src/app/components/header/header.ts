import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CategoryEnum } from '../../models/category.enum';
import { AsyncPipe, TitleCasePipe } from '@angular/common';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-header',
  imports: [RouterModule, TitleCasePipe],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
  productService = inject(ProductService);
  cartService = inject(CartService);

  ngAfterViewInit() {
    /*Hamburguer menu disappears if a link is clicked*/
    const menuBar = document.getElementById('menu-bar') as HTMLInputElement;
    const navbarLinks = document.querySelectorAll('.navbar a');
    navbarLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (menuBar && menuBar.checked) {
          menuBar.checked = false;
        }
      });
    });
  }

  /*Categories*/
  categorias = Object.entries(CategoryEnum).map(([key, value]) => ({
    key,
    value
  }));

  setCategoria(cat: string | null) {
    this.productService.setCat(cat);
  }
}

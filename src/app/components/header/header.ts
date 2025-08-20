import { Component, ElementRef, HostListener, inject, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CategoryEnum } from '../../models/category.enum';
import { AsyncPipe, TitleCasePipe } from '@angular/common';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  imports: [RouterModule, TitleCasePipe],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
  productService = inject(ProductService);
  cartService = inject(CartService);
  authService = inject(AuthService);

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

  // Desmarcar checkbox
  @ViewChild('catalogToggleCheckbox') catalogToggleCheckbox!: ElementRef<HTMLInputElement>;
  @ViewChild('submenu') submenu!: ElementRef<HTMLElement>;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const clickTarget = event.target as HTMLElement;

    if (this.submenu && !this.submenu.nativeElement.contains(clickTarget)) {
      this.catalogToggleCheckbox.nativeElement.checked = false;
    }
  }
}

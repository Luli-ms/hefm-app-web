import { Component } from '@angular/core';
import { AboutUs } from '../about-us/about-us';
import { Catalog } from '../catalog/catalog';

@Component({
  selector: 'app-main',
  imports: [AboutUs, Catalog],
  templateUrl: './main.html',
  styleUrl: './main.css'
})
export class Main {

}

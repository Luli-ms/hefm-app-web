import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Auth, signInAnonymously } from '@angular/fire/auth';
import { Firestore, collection, getDocs } from '@angular/fire/firestore';
import { Storage, getDownloadURL, ref } from '@angular/fire/storage';
import { ProductInterface } from './models/product.interface';

@Injectable({
  providedIn: 'root'
})
export class Prueba {
  firestore = inject(Firestore);
  auth = inject(Auth);
  storage = inject(Storage);
  http = inject(HttpClient);
  url: string = 'assets/data/prods.json';

  testAuth() {
    signInAnonymously(this.auth).then(() => {
      console.log('Auth works')
    })
  }
}


import { CommonModule } from '@angular/common';
import { Header } from './components/header/header';
import { Router, RouterOutlet } from '@angular/router';
import { ProductService } from './services/product.service';
import { Component, inject, OnInit } from '@angular/core';
import { Footer } from './components/footer/footer';
import { Order } from './components/order/order';
import { AuthService } from './services/auth.service';
import { doc, getDoc } from 'firebase/firestore';
import { UserInterface } from './models/user.interface';

@Component({
  selector: 'app-root',
  imports: [CommonModule, Header, RouterOutlet, Footer, Order],
  templateUrl: './app.html',
  styleUrl: './app.css'
})

export class App implements OnInit {
  authService = inject(AuthService);
  router = inject(Router);

  ngOnInit(): void {
    this.authService.user$.subscribe(async user => {
      if (user) {
        const userDocRef = doc(this.authService.db, `users/${user.uid}`);
        const userSnap = await getDoc(userDocRef);

        if (userSnap.exists()) {
          const firestoreData = userSnap.data() as Omit<UserInterface, 'uid' | 'email' | 'name'>
          this.authService.currUserSign.set({
            uid: user.uid,
            email: user.email!,
            name: user.displayName!,
            ...firestoreData
          });
        } else {
          console.error('Documento de usuario no encontrado en Firestore');
        }
      } else {
        this.authService.currUserSign.set(null);
      }
    })
  }
}

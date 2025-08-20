import { inject, Injectable, signal } from '@angular/core';
import { Auth, user } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { from, Observable } from 'rxjs';
import { UserInterface } from '../models/user.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  db = inject(Firestore);
  firebaseAuth = inject(Auth);

  user$ = user(this.firebaseAuth); // User data
  currUserSign = signal<UserInterface | null | undefined>(undefined);

  register(email: string, name: string, password: string, phoneNumber: string, address: string): Observable<void> {
    const promise = createUserWithEmailAndPassword(this.firebaseAuth, email, password)
      // Update profile
      .then(async response => {
        const user = response.user;
        await updateProfile(user, { displayName: name });
        return user;
      })
      // Save data to Firestore
      .then(user => {
        const uid = user.uid;
        const userRef = doc(this.db, `users/${uid}`);
        return setDoc(userRef, {
          name: name,
          lvlDescuento: 'lvl1',
          phone: phoneNumber,
          address: address
        });
      });


    return from(promise)
  }

  login(email: string, password: string): Observable<void> {
    const promise = signInWithEmailAndPassword(this.firebaseAuth, email, password)
      .then(() => { });

    return from(promise);
  }

  logout(): Observable<void> {
    const promise = signOut(this.firebaseAuth);

    return from(promise);
  }

}

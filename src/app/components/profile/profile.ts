import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { GroupDigitsPipe } from '../pipes/group-digits-pipe';
import { CommonModule } from '@angular/common';
import { updateEmail, updateProfile } from 'firebase/auth';
import { BehaviorSubject, filter, firstValueFrom, from, map, Observable, switchMap } from 'rxjs';
import { UserInterface } from '../../models/user.interface';
import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { LvlEnum } from '../../models/lvl.enum';
import { Municipios } from '../../services/municipios.service';

@Component({
  selector: 'app-profile',
  imports: [GroupDigitsPipe, CommonModule, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
  authService = inject(AuthService);
  router = inject(Router);
  muniService = inject(Municipios);
  fb = inject(FormBuilder);

  editMode = false;

  user = this.authService.currUserSign;
  private _userData = new BehaviorSubject<UserInterface | null>(null);
  userData$ = this._userData.asObservable();
  municipios = this.muniService.getMunicipios();

  form = this.fb.nonNullable.group({
    firstname: ['', [Validators.required, Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/)]],
    lastname: ['', [Validators.required, Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/)]],
    municipio: ['', Validators.required],
    calle: ['', [Validators.required, Validators.pattern(/^[a-zA-ZÀ-ÿ0-9\s]+$/)]],
    numero: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
    phone: ['', [
      Validators.required,
      Validators.pattern(/^\d{9}$/)  // solo 9 dígitos, válido para España
    ]],
  });

  ngOnInit() {
    this.authService.user$.pipe(
      filter((u): u is any => !!u),
      switchMap(user => {
        const userRef = doc(this.authService.db, `users/${user.uid}`);
        return new Observable<UserInterface>(subscriber => {
          const unsubscribe = onSnapshot(userRef, snap => {
            const data = snap.data() || {};
            subscriber.next({
              name: user.displayName || data['name'] || '',
              email: user.email || '',
              phone: data['phone'] || '',
              address: data['address'] || '',
              uid: user.uid,
              lvlDescuento: data['lvlDescuento'] || LvlEnum.lvl1
            });
          });

          return { unsubscribe };
        });
      })
    ).subscribe(userData => {
      this._userData.next(userData);

      const { calle, numero, municipio } = this.splitAddress(userData.address);
      const [firstname, ...lastnameParts] = userData.name.split(' ');
      const lastname = lastnameParts.join(' ');

      this.form.patchValue({
        firstname,
        lastname,
        phone: userData.phone,
        municipio,
        calle,
        numero
      });
    });
  }

  private splitAddress(address: string) {
    if (!address) {
      return { calle: '', numero: '', municipio: '' };
    }

    const [callePart, municipio = ''] = address.split(',').map(s => s.trim());

    const cleaned = callePart.replace(/\s*nº\s*/i, ' nº ');
    const [calle, numero = ''] = cleaned.split(' nº ').map(s => s.trim());

    return {
      calle: calle || '',
      numero: numero || '',
      municipio: municipio || ''
    };
  }



  logout() {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }

  toggleEditMode() {
    if (!this.editMode) {
      this.editMode = true;
    } else {
      this.editMode = false;

      const updatedData = this._userData.getValue();
      const rawForm = this.form.getRawValue();

      const name = `${rawForm.firstname} ${rawForm.lastname}`;
      const address = `${rawForm.calle} nº ${rawForm.numero}, ${rawForm.municipio}`;

      const profile: UserInterface = {
        ...updatedData!,
        name,
        phone: rawForm.phone,
        address
      };

      this.saveUserProfile(profile)
        .then(() => console.log('Perfil actualizado'))
        .catch(err => console.error(err));
    }
  }


  async saveUserProfile(profile: UserInterface) {
    await this.updateAuthData(profile.name, profile.email);
    await this.updateFirestoreData(profile);
  }

  private async updateAuthData(name: string, email: string) {
    const user = await firstValueFrom(this.authService.user$);
    if (!user) return;

    await updateProfile(user, { displayName: name });

    if (email && email !== user.email) {
      await updateEmail(user, email);
    }
  }

  private async updateFirestoreData(data: UserInterface) {
    const userRef = doc(this.authService.db, `users/${data.uid}`);
    const snap = await getDoc(userRef);
    const currentData = snap.exists() ? snap.data() : {};

    await updateDoc(userRef, {
      ...data,
      lvlDescuento: currentData['lvlDescuento']
    });
  }

  get firstname() {
    return this.form.get('firstname');
  }

  get lastname() {
    return this.form.get('lastname');
  }

  get calle() {
    return this.form.get('calle');
  }

  get numero() {
    return this.form.get('numero');
  }

  get phone() {
    return this.form.get('phone');
  }

  /*
  firstname: ['', [Validators.required, Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/)]],
    lastname: ['', [Validators.required, Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/)]],
    municipio: ['', Validators.required],
    calle: ['', [Validators.required, Validators.pattern(/^[a-zA-ZÀ-ÿ0-9\s]+$/)]],
    numero: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
    phone: ['', [
      Validators.required,
      Validators.pattern(/^\d{9}$/)  // solo 9 dígitos, válido para España
    ]],
  */
}

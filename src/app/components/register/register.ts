import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { Municipios } from '../../services/municipios.service';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  fb = inject(FormBuilder)
  authService = inject(AuthService);
  router = inject(Router);
  muniService = inject(Municipios);

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    firstname: ['', [Validators.required, Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/)]],
    lastname: ['', [Validators.required, Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/)]],
    municipio: ['', Validators.required],
    calle: ['', [Validators.required, Validators.pattern(/^[a-zA-ZÀ-ÿ0-9\s]+$/)]],
    numero: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
    phoneNumber: ['', [
      Validators.required,
      Validators.pattern(/^\d{9}$/)  // solo 9 dígitos, válido para España
    ]],
  });

  municipios = this.muniService.getMunicipios();

  get firstname() {
    return this.form.get('firstname');
  }

  get lastname() {
    return this.form.get('lastname');
  }

  get email() {
    return this.form.get('email');
  }

  get password() {
    return this.form.get('password');
  }

  get phoneNumber() {
    return this.form.get('phoneNumber');
  }

  get calle() {
    return this.form.get('calle');
  }

  get numero() {
    return this.form.get('numero')
  }

  errorMessage = signal<string | null>(null);
  get errorText(): string | null {
    switch (this.errorMessage()) {
      case 'auth/invalid-email':
        return 'Introduzca un correo válido';
      case 'auth/weak-password':
        return 'La contraseña debe tener al menos 6 caracteres';
      case 'auth/email-already-in-use':
        return 'El correo que ha usado ya ha sido registrado';
      default:
        return null;
    }
  }

  isLoading = signal<boolean>(false);

  onSubmit(): void {
    if (this.form.invalid) return;

    this.isLoading.set(true);

    const rawForm = this.form.getRawValue();

    const name = `${rawForm.firstname} ${rawForm.lastname}`;
    const address = `${rawForm.calle} nº ${rawForm.numero}, ${rawForm.municipio}`;

    this.authService
      .register(rawForm.email, name, rawForm.password, rawForm.phoneNumber, address)
      .subscribe({
        next: () => {
          this.router.navigateByUrl('/login')
          this.isLoading.set(false);
        },
        error: (err) => {
          this.errorMessage.set(err.code);
          this.isLoading.set(false);
        }
      })
  }

}

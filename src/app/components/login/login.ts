import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  fb = inject(FormBuilder);
  authService = inject(AuthService);
  router = inject(Router);

  form = this.fb.nonNullable.group({
    email: ['', Validators.required],
    password: ['', Validators.required],
  });

  errorMessage = signal<string | null>(null);

  isLoading = signal<boolean>(false);

  onSubmit(): void {
    if (this.form.invalid) return;

    this.isLoading.set(true);

    const rawForm = this.form.getRawValue();

    this.authService
      .login(rawForm.email, rawForm.password)
      .subscribe({
        next: () => {
          this.router.navigateByUrl('/profile')
        },
        error: (err) => {
          this.errorMessage.set(err.code);
          console.warn(err.code)
          this.isLoading.set(false);
        }
      })
  }
}

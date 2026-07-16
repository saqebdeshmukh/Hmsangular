import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.services';

@Component({
  selector: 'app-login-component',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './login-component.html',
  styleUrl: './login-component.css',
})
export class LoginComponent {

  loginForm: FormGroup;

  errorMessage = signal<string>('');
  isLoading = signal<boolean>(false);

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private auth: AuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  onSubmit() {

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.errorMessage.set('');

    const { email, password } = this.loginForm.value;

    this.auth.login({ email, password }).subscribe({
      next: () => {

        const role = this.auth.user()?.role;

        switch (role) {
          case 'Admin':
            this.router.navigate(['/admin']);
            break;
          case 'Doctor':
            this.router.navigate(['/doctordashboard']);
            break;
          case 'Receptionist':
            this.router.navigate(['/receptionistdashboard']);
            break;
          default:
            this.router.navigate(['/']);
        }
      },

      error: (err) => {
        this.errorMessage.set(
          err?.error?.message || 'Invalid email or password'
        );
      }
    });
  }
}
import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.services';

@Component({
  selector: 'app-register-component',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register-component.html',
  styleUrl: './register-component.css',
})
export class RegisterComponent {

  registerForm: FormGroup;

  errorMessage = signal<string>('');
  isLoading = signal<boolean>(false);

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private auth: AuthService
  ) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],

      firstName: ['', Validators.required],
      lastName: ['', Validators.required],

      dateOfBirth: ['', Validators.required],
      gender: ['', Validators.required],
      phone: ['', Validators.required]
    });
  }

  get f() {
    return this.registerForm.controls;
  }

  onSubmit() {

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const { email, password, confirmPassword } = this.registerForm.value;

    if (password !== confirmPassword) {
      this.errorMessage.set('Passwords do not match');
      return;
    }

    this.errorMessage.set('');
    this.isLoading.set(true);

    // 🔹 Simulate API
    setTimeout(() => {

      const role = 'Patient';

      // ✅ Create fake JWT
      const fakeToken = this.createFakeToken(email, role);
      const fakeRefreshToken = 'dummy-refresh-token';

      this.auth.setSession(fakeToken, fakeRefreshToken);

      this.router.navigate(['/patient']);

      this.isLoading.set(false);

    }, 1000);
  }

  // =============================
  // 🔥 Fake JWT Generator
  // =============================
  private createFakeToken(email: string, role: string): string {

    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));

    const payload = btoa(JSON.stringify({
      sub: 1,
      email: email,
      role: role,
      exp: Math.floor(Date.now() / 1000) + 60 * 60
    }));

    const signature = 'fake-signature';

    return `${header}.${payload}.${signature}`;
  }
}
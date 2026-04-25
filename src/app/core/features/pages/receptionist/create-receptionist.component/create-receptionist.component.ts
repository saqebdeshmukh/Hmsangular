import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ReceptionistService } from '../../../../services/receptionist.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-create-receptionist.component',
  imports: [RouterModule,ReactiveFormsModule],
  templateUrl: './create-receptionist.component.html',
  styleUrl: './create-receptionist.component.css',
})
export class CreateReceptionistComponent {
  private fb = inject(FormBuilder);
  private service = inject(ReceptionistService);
  private router = inject(Router);

  loading = signal(false);
  submitted = signal(false);

  form = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    phone: ['']
  });

  get f() {
    return this.form.controls;
  }

  submit() {
    this.submitted.set(true);

    if (this.form.invalid) return;

    this.loading.set(true);
    this.service.createReceptionist(this.form.value).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/receptionists']);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }
}

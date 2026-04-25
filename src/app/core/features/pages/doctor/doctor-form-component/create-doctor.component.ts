import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DoctorService } from '../../../../services/doctor.service';
import { ToastService } from '../../../../services/toast.service';
import { DoctorFormComponent } from './doctor-form-component';

@Component({
  selector: 'app-create-doctor',
  standalone: true,
  imports: [DoctorFormComponent],
  template: `
  <h3>Create Doctor</h3>
  <app-doctor-form-component (formSubmit)="create($event)"></app-doctor-form-component>
  `
})
export class CreateDoctorComponent {

 private service = inject(DoctorService);
  private router = inject(Router);
  private toast = inject(ToastService);

  create(data: any) {
    this.service.createDoctor(data).subscribe(() => {
      this.toast.success('Doctor created');
      this.router.navigate(['/doctors']);
    });
  }
}
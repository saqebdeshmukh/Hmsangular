import { Component, Input, Output, EventEmitter, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../services/auth.services';

@Component({
  selector: 'app-patient-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './patient-form-component.html',
})
export class PatientFormComponent implements OnInit {

  private fb = inject(FormBuilder);
  auth = inject(AuthService);

  @Input() initialData: any = null;
  @Input() isEdit = false;
  @Input() doctors: any[] = [];

  @Output() formSubmit = new EventEmitter<any>();

  showModal = signal(false);


  form = this.fb.group({
    id: [''],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    dateOfBirth: ['', Validators.required],
    gender: ['', Validators.required],
    bloodGroup: [''],
    phone: ['', [Validators.required, Validators.minLength(10)]],
    address: [''],
    doctorId: [''],
    weight: [''],
    height: [''],
    diastolicBp: [''],
    systolicBp: [''],
    sugarBeforeMeal: [''],
    sugarAfterMeal: [''],
    reason: ['']
  });

  ngOnInit() {
    if (this.initialData) {
      this.form.patchValue(this.initialData);
    }
  }

  get f() {
    return this.form.controls;
  }

  submit(bookAppointment = false) {

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.formSubmit.emit({
      ...this.form.value,
      bookAppointment
    });
  }

  openModal() {
    if (this.isEdit) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.doctors.length === 1) {
      this.form.patchValue({
        doctorId: this.doctors[0].id
      });

      this.formSubmit.emit({
        ...this.form.value,
        bookAppointment: true
      });

      return;
    }

    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  confirmBooking() {
    if (this.isEdit) return;


    this.formSubmit.emit({
      ...this.form.value,
      // reason: this.reason(),
      bookAppointment: true
    });
    this.closeModal();
  }
}
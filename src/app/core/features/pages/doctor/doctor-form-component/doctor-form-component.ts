import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-doctor-form-component',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './doctor-form-component.html',
  styleUrl: './doctor-form-component.css',
})
export class DoctorFormComponent {
   private fb = inject(FormBuilder);

  @Input() initialData: any = null;
  @Input() isEdit = false;

  @Output() formSubmit = new EventEmitter<any>();

  form = this.fb.nonNullable.group({
    id: [null],

    userEmail: ['', [Validators.required, Validators.email]],
    userPassword: ['', [Validators.required, Validators.minLength(6)]],

    firstName: ['', Validators.required],
    lastName: ['', Validators.required],

    specialization: ['', Validators.required],
    consultationFee: [0, [Validators.required, Validators.min(0)]],

    phoneNumber: [''],
    email: ['', Validators.email],
    address : [''],
    regNo: [''],
  });

  specializations = [
    'General Practice','Cardiology','Dermatology','Endocrinology',
    'Gastroenterology','Gynecology','Nephrology','Neurology',
    'Oncology','Ophthalmology','Orthopedics','Pediatrics',
    'Psychiatry','Pulmonology','Radiology','Rheumatology',
    'Surgery','Urology'
  ];

  ngOnInit() {

    if (this.initialData) {
      this.form.patchValue(this.initialData);
    }

    if (this.isEdit) {
      // Remove password validation in edit
      this.form.get('userPassword')?.clearValidators();
      this.form.get('userPassword')?.updateValueAndValidity();

      // Disable email in edit
      this.form.get('userEmail')?.disable();
    }
  }

  get f() {
    return this.form.controls;
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = {
      ...this.form.getRawValue()
    };

    

    this.formSubmit.emit(payload);
  }
}

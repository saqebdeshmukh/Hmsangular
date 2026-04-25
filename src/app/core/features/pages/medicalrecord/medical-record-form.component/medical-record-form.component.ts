import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-medical-record-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './medical-record-form.component.html',
  styleUrl: './medical-record-form.component.css',
})
export class MedicalRecordFormComponent implements OnChanges {
  private fb = inject(FormBuilder);
 private route = inject(ActivatedRoute);
  @Input() initialData: any = null;
  @Input() appointment: any = null;
  @Input() isEdit = false;

  @Output() formSubmit = new EventEmitter<any>();

  form = this.fb.group({
    id: [null],
    appointmentId: ['', Validators.required],
    patientId: ['', Validators.required],
    doctorId: ['', Validators.required],

    visitDate: ['', Validators.required],
    symptoms: ['', Validators.required],
    diagnosis: ['', Validators.required],
    treatment: ['', Validators.required],
    notes: ['']
  });

  ngOnChanges(changes: SimpleChanges) {

    if (changes['initialData']?.currentValue) {

      const data = changes['initialData'].currentValue;

      this.form.patchValue({
        id: data.id,
        appointmentId: data.appointmentId,
        patientId: data.patientId,
        doctorId: data.doctorId,
        visitDate: this.formatDate(data.visitDate), // ✅ FIX
        symptoms: data.symptoms,
        diagnosis: data.diagnosis,
        treatment: data.treatment,
        notes: data.notes
      });

      console.log('Patched form:', this.form.value);
    }

    if (changes['appointment']?.currentValue) {
      const a = changes['appointment'].currentValue;

      this.form.patchValue({
        appointmentId: a.id,
        patientId: a.patientId,
        doctorId: a.doctorId,
        visitDate: this.formatDate(new Date().toISOString()) // ✅ FIX
      });
    }
  }

  formatDate(date: string) {
  if (!date) return '';
  const d = new Date(date);
  return d.toISOString().slice(0, 16);
}

  get f() {
    return this.form.controls;
  }

  submit() {
    console.log('Submit clicked');
    if (this.form.invalid) {
      console.log(this.form.value);
      console.log(this.form.errors);
      this.form.markAllAsTouched();
      return;
    }
console.log('Form valid'); // 👈 confirm
    this.formSubmit.emit(this.form.getRawValue());
  }
}

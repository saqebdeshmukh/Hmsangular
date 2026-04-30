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
    notes: [''],
    weight: [''],
    height: [''],
    diastolicBp: [''],
    systolicBp: [''],
    sugarBeforeMeal: [''],
    sugarAfterMeal: [''],
    reason: ['']
  });

  ngOnChanges(changes: SimpleChanges) {

    if (changes['initialData']?.currentValue) {

      const data = changes['initialData'].currentValue;

      this.form.patchValue({
        id: data.id,
        appointmentId: data.appointmentId,
        patientId: data.patientId,
        doctorId: data.doctorId,
        visitDate: this.formatDate(data.visitDate),
        symptoms: data.symptoms,
        diagnosis: data.diagnosis,
        treatment: data.treatment,
        weight: data.weight,
        height: data.height,
        diastolicBp: data.diastolicBp,
        systolicBp: data.systolicBp,
        sugarBeforeMeal: data.sugarBeforeMeal,
        sugarAfterMeal: data.sugarAfterMeal,
        notes: data.notes
      });

    }

    if (changes['appointment']?.currentValue) {
      const a = changes['appointment'].currentValue;

      this.form.patchValue({
        appointmentId: a.id,
        patientId: a.patientId,
        doctorId: a.doctorId,
        weight: a.weight,
        height: a.height,
        diastolicBp: a.diastolicBp,
        systolicBp: a.systolicBp,
        sugarBeforeMeal: a.sugarBeforeMeal,
        sugarAfterMeal: a.sugarAfterMeal,

        visitDate: this.formatDate(new Date().toISOString())
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
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.formSubmit.emit(this.form.getRawValue());
  }
}

import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../../../services/auth.services';

@Component({
  selector: 'app-medical-record-form',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './medical-record-form.component.html',
  styleUrl: './medical-record-form.component.css',
})
export class MedicalRecordFormComponent implements OnChanges {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  role = computed(() => this.auth.user()?.role);
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
    treatment: [''],
    notes: [''],
    weight: [''],
    height: [''],
    bloodPressure: [''],
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
        bloodPressure: data.bloodPressure,
        sugarBeforeMeal: data.sugarBeforeMeal,
        sugarAfterMeal: data.sugarAfterMeal,
        notes: data.notes
      });

    }

    // Only apply appointment-derived defaults when creating a new record
    if (changes['appointment']?.currentValue && !this.isEdit) {
      const a = changes['appointment'].currentValue;
console.log('Appointment data received:', a);
      this.form.patchValue({
        appointmentId: a.id,
        patientId: a.patientId,
        doctorId: a.doctorId,
        weight: a.weight ?? '0',
        height: a.height ?? '0',
        bloodPressure: a.bloodPressure ?? '0',
        sugarBeforeMeal: a.sugarBeforeMeal ?? '0',
        sugarAfterMeal: a.sugarAfterMeal ?? '0',

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

  get familyHistory() {
    // Prefer current appointment data; fall back to initialData when appointment is not provided
    return this.parseFamilyHistory(this.appointment || this.initialData);
  }

  private parseFamilyHistory(record: any) {
    const raw = record?.geneticFrom || record?.GeneticFrom || record?.genetic || '';
    const lines = raw
      .toString()
      .split(/\r?\n/)
      .map((line: string) => line.trim())
      .filter(Boolean);

    const history = {
      parents: '',
      grandparents: ''
    };

    for (const line of lines) {
      const normalized = line.replace(/\s+/g, ' ').trim();
      const value = normalized.replace(/^[^:]+:\s*/i, '');

      if (/grand\s*parents?/i.test(normalized)) {
        history.grandparents = value;
      } else if (/parents?/i.test(normalized)) {
        history.parents = value;
      }
    }

    if (!history.parents && lines.length > 0 && !history.grandparents) {
      history.parents = lines.join(' | ');
    }

    return history;
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.formSubmit.emit(this.form.getRawValue());
  }
  saveAndComplete() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const data: any = this.form.getRawValue();
    data.isComplete = true;
    this.formSubmit.emit(data);
  }
}

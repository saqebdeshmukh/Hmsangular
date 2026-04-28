import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

@Component({
  selector: 'app-prescription-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './prescription-form.component.html'
})
export class PrescriptionFormComponent implements OnChanges {

  private fb = inject(FormBuilder);

  @Input() initialData: any = null;
  @Input() record: any = null;
  @Input() isEdit = false;
  @Input() isReceptionist = false;
  @Input() patients: any[] = [];
  @Input() doctors: any[] = [];

  @Output() formSubmit = new EventEmitter<any>();

  form = this.fb.group({
    id: [null],
    medicalRecordId: [''],
    patientId: ['', Validators.required],
    doctorId: ['', Validators.required],
    type: ['MedicalStore'],
    instructions: [''],

    items: this.fb.array([])
  });

  // 👉 FormArray getter
  get items(): FormArray {
    return this.form.get('items') as FormArray;
  }

  ngOnChanges(changes: SimpleChanges) {

  if (changes['initialData']?.currentValue) {
    const data = changes['initialData'].currentValue;

    console.log('Incoming edit data:', data);

    // ✅ Patch basic fields
    this.form.patchValue({
      id: data.id,
      medicalRecordId: data.medicalRecordId,
      patientId: data.patientId,
      doctorId: data.doctorId,
      type: data.type,
      instructions: data.instructions
    });

    // 🔥 IMPORTANT: clear old rows
    this.items.clear();

    // ✅ FIX: map correct property
    const items = data.items || data.prescriptionItemRequests || [];

    items.forEach((item: any) => {
      this.items.push(this.createItem({
        medicineName: item.medicineName,
        dosage: item.dosage,
        frequency: item.frequency,
        duration: item.duration,
        mealTiming: item.mealTiming
      }));
    });

    // fallback
    if (items.length === 0) {
      this.addItem();
    }
  }
}

  createItem(data: any = {}) {
    return this.fb.group({
      medicineName: [data.medicineName || '', Validators.required],
      dosage: [data.dosage || '', Validators.required],
      frequency: [data.frequency || 3],
      duration: [data.duration || '', Validators.required],
      mealTiming: [data.mealTiming || 'After Meal']
    });
  }

  addItem() {
    this.items.push(this.createItem());
  }

  removeItem(index: number) {
    this.items.removeAt(index);
  }

  // ✅ Quick Add
  quickAdd(med: any) {
    const emptyRow = this.items.controls.find(c => !c.value.medicineName);

    if (emptyRow) {
      emptyRow.patchValue(med);
    } else {
      this.items.push(this.createItem(med));
    }
  }

  submit() {
    if (this.form.invalid) {
      console.log('Form is invalid:', this.form.errors, this.form.value);
      this.form.markAllAsTouched();
      return;
    }

    this.formSubmit.emit(this.form.getRawValue());
  }
}
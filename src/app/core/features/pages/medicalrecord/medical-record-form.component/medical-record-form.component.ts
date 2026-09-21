import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject, computed, ChangeDetectorRef, signal } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../../../services/auth.services';
import { PatientService } from '../../../../services/patient.service';
import { PrescriptionService } from '../../../../services/prescription.service';
import { catchError, debounceTime, distinctUntilChanged, finalize, map, switchMap, timeout } from 'rxjs/operators';
import { of, Subscription } from 'rxjs';
import { MedicalRecordService } from '../../../../services/medicarecord.service';
import { ToastService } from '../../../../services/toast.service';

@Component({
  selector: 'app-medical-record-form',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './medical-record-form.component.html',
  styleUrl: './medical-record-form.component.css',
})
export class MedicalRecordFormComponent implements OnChanges {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private prescriptionService = inject(PrescriptionService);
  private medicalRecordService = inject(MedicalRecordService);
  private toastr = inject(ToastService);
  role = computed(() => this.auth.user()?.role);
  @Input() initialData: any = null;
  @Input() appointment: any = null;
  @Input() medicalHistory: any[] = [];
  @Input() isEdit = false;

  @Output() formSubmit = new EventEmitter<any>();

 suggestions: { [key: number]: any[] } = {};
focusedSuggestion: { [key: number]: number } = {};
 appointmentId = signal<any | null>(null);
  quickAddMedicines: any[] = [];
  loadingQuickAddMedicines = false;

  quickAddError = '';
  allergies: any[] = [];
  allergyActionInProgress = signal(false);
  allergyControl = this.fb.nonNullable.control('');
  private quickAddMedicinesByType: Record<'Internal' | 'MedicalStore', any[]> = {
    Internal: [],
    MedicalStore: []
  };
  private quickAddRequest?: Subscription;

private rowSubs: { [key: number]: Subscription } = {};

private cdr = inject(ChangeDetectorRef);
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

  prescriptionForm = this.fb.group({
    id: [null],
    medicalRecordId: [''],
    patientId: [''],
    doctorId: [''],
    type: ['Internal'],
    instructions: [''],
    internalPrescriptionId: [null],
  externalPrescriptionId: [null],
    appointmentDate: [this.getMinDate()],
    internalItems: this.fb.array([]),
    externalItems: this.fb.array([])
  });

  ngOnInit(): void {
    this.ensurePrescriptionRow();
    this.loadAllergies();
  }

  private loadAllergies(): void {
    const patientId = this.getPatientId();
    if (!patientId) {
      return;
    }

    this.medicalRecordService.getAllergiesByPatientId(patientId).pipe(
      catchError(() => {
        this.toastr.error('Unable to load allergies.');
        return of([]);
      })
    ).subscribe({
      next: response => {
        this.updateAllergiesFromResponse(response);
      }
    });
  }
ngAfterViewInit(): void {
  this.loadQuickAddMedicines();
}

private loadQuickAddMedicines(): void {
  this.loadingQuickAddMedicines = true;
  this.quickAddError = '';
  const type =
    this.prescriptionForm.get('type')?.value === 'MedicalStore'
      ? 'MedicalStore'
      : 'Internal';

  this.quickAddRequest?.unsubscribe();
  this.quickAddMedicines = this.quickAddMedicinesByType[type];

  this.quickAddRequest = this.prescriptionService
    .getAddQuickPrescription(type)
    .pipe(
      timeout(10000),
      finalize(() => {
        this.loadingQuickAddMedicines = false;
        this.cdr.detectChanges();
      })
    )
    .subscribe({
      next: response => {
        const medicines = (response?.data || []).map((medicine: any) => this.normalizeMedicine(medicine));
        this.quickAddMedicinesByType[type] = medicines;
        if (this.prescriptionForm.get('type')?.value === type) {
          this.quickAddMedicines = medicines;
        }
        if (!this.quickAddMedicines.length) {
          this.quickAddError = response?.message || 'No quick-add medicines found.';
        }
      },
      error: () => {
        this.quickAddMedicines = [];
        this.quickAddError = 'Unable to load quick-add medicines.';
      }
    });
}
  ngOnChanges(changes: SimpleChanges) {
    if (changes['initialData']?.currentValue) {
      this.patchInitialData(changes['initialData'].currentValue, this.isEdit);
      this.setAllergies(changes['initialData'].currentValue);
    }

    if (changes['appointment']?.currentValue && !this.isEdit) {
      const a = changes['appointment'].currentValue;
      this.appointmentId.set(a.id);
      this.setAllergies(a);

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

      this.prescriptionForm.patchValue({
        patientId: a.patientId,
        doctorId: a.doctorId,
        appointmentDate: this.getMinDate()
      });
    }
  }

  private getMinDate(): string {
    const date = new Date();
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().slice(0, 16);
  }

 private ensurePrescriptionRow(): void {
  const internalItems =
    this.prescriptionForm.get('internalItems') as FormArray;

  const externalItems =
    this.prescriptionForm.get('externalItems') as FormArray;

  if (internalItems.length === 0) {
    internalItems.push(this.createPrescriptionItem());
  }

  if (externalItems.length === 0) {
    externalItems.push(this.createPrescriptionItem());
  }

  // Attach debounce to the currently active row
  this.attachAutocompleteToIndex(0);
}

  get activePrescriptionItems(): FormArray {
    const key = this.prescriptionForm.get('type')?.value === 'MedicalStore' ? 'externalItems' : 'internalItems';
    return this.prescriptionForm.get(key) as FormArray;
  }

  get internalPrescriptionItems(): FormArray {
    return this.prescriptionForm.get('internalItems') as FormArray;
  }

  get externalPrescriptionItems(): FormArray {
    return this.prescriptionForm.get('externalItems') as FormArray;
  }getHistoryPrescriptionItemCount(record: any, type: string): number {
  return record?.prescriptions
    ?.filter((p: any) => p.type === type)
    ?.reduce(
      (count: number, p: any) =>
        count + (p.prescriptionItemRequests?.length || 0),
      0
    ) || 0;
}
hasHistoryPrescription(record: any, type: string): boolean {
  return !!record?.prescriptions?.some(
    (p: any) =>
      p.type === type &&
      p.prescriptionItemRequests?.length > 0
  );
}

  // get internalHistoryItems() {
  //   return this.internalPrescriptionItems.controls.filter(item => item.get('medicineName')?.value?.trim());
  // }

  // get externalHistoryItems() {
  //   return this.externalPrescriptionItems.controls.filter(item => item.get('medicineName')?.value?.trim());
  // }

  setPrescriptionTab(type: 'Internal' | 'MedicalStore'): void {
    this.prescriptionForm.patchValue({ type });
    this.ensurePrescriptionRow();
    this.loadQuickAddMedicines();
  }

  private createPrescriptionItem(data: any = {}) {
    return this.fb.group({
      id: [data.id ?? null],
      medicineName: [data.medicineName || '', Validators.required],
      dosage: [data.dosage || '', Validators.required],
      frequency: [data.frequency || 1],
      duration: [data.duration || '', Validators.required],
      mealTiming: [data.mealTiming || 'After Meal']
    });
  }

  

  removePrescriptionItem(index: number): void {
    const items = this.prescriptionForm.get(this.prescriptionForm.get('type')?.value === 'MedicalStore' ? 'externalItems' : 'internalItems') as FormArray;
    if (items.length > 1) {
      items.removeAt(index);
    }
  }

private attachAutocompleteToIndex(index: number): void {

  // Remove previous subscription for this row
  if (this.rowSubs[index]) {
    this.rowSubs[index].unsubscribe();
  }

  const control = this.activePrescriptionItems
    .at(index)
    ?.get('medicineName');

  if (!control) {
    return;
  }

  const sub = control.valueChanges.pipe(

    // Wait until user stops typing
    debounceTime(300),

    // Don't call API for same value
    distinctUntilChanged(),

    switchMap((term: any) => {

      const q = (term || '')
        .toString()
        .trim();

      // Minimum 2 characters
      if (q.length < 2) {

        this.suggestions[index] = [];
        this.focusedSuggestion[index] = -1;

        this.cdr.detectChanges();

        return of([]);
      }

      return this.prescriptionService
        .getSearchedMedicine(q)
        .pipe(
          map((res: any) => res?.data || []),
          catchError(() => of([]))
        );
    })

  ).subscribe((list: any[]) => {

    this.suggestions[index] = [...list];
    this.focusedSuggestion[index] = -1;

    this.cdr.detectChanges();
  });

  this.rowSubs[index] = sub;
}

addPrescriptionItem(): void {
  const items = this.activePrescriptionItems;
  const currentItem = items.at(items.length - 1);

  if (currentItem.invalid) {
    currentItem.markAllAsTouched();
    return;
  }

  items.push(this.createPrescriptionItem());

  this.attachAutocompleteToIndex(items.length - 1);
}

 quickAddMedicine(medicine: any): void {

  const items = this.activePrescriptionItems;

  const emptyIndex = items.controls.findIndex(
    control => !control.value.medicineName?.trim()
  );

  if (emptyIndex !== -1) {

    items.at(emptyIndex).patchValue(medicine);

    // Clear any old suggestions
    this.suggestions[emptyIndex] = [];
    this.focusedSuggestion[emptyIndex] = -1;

    return;
  }

  items.push(this.createPrescriptionItem(medicine));
  this.attachAutocompleteToIndex(items.length - 1);
}

  private normalizeMedicine(medicine: any): any {
    return {
      medicineName: medicine.medicineName || medicine.MedicineName || medicine.name || medicine.Name || '',
      dosage: medicine.dosage || medicine.Dosage || '',
      frequency: Number(medicine.frequency ?? medicine.Frequency) || 1,
      duration: medicine.duration || medicine.Duration || '',
      mealTiming: medicine.mealTiming || medicine.MealTiming || 'After Meal'
    };
  }

  onMedicineKeydown(event: KeyboardEvent, index: number): void {
    const list = this.suggestions[index] || [];
    if (!list.length) {
      return;
    }

    const current = this.focusedSuggestion[index] ?? -1;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.focusedSuggestion[index] = Math.min(current + 1, list.length - 1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.focusedSuggestion[index] = Math.max(current - 1, 0);
    } else if (event.key === 'Enter' && current >= 0) {
      event.preventDefault();
      this.selectMedicine(index, list[current]);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.suggestions[index] = [];
      this.focusedSuggestion[index] = -1;
    }
  }

  selectMedicine(index: number, medicine: any): void {
    const item = this.activePrescriptionItems.at(index);
    if (!item) {
      return;
    }

    const current = item.value;
    item.patchValue({
      id: medicine.id || current.id,
      medicineName: medicine.name || medicine.Name || medicine.medicineName || medicine.MedicineName || '',
      dosage: medicine.dosage || medicine.Dosage || current.dosage,
      frequency: medicine.frequency || medicine.Frequency || current.frequency,
      duration: medicine.duration || medicine.Duration || current.duration,
      mealTiming: medicine.mealTiming || medicine.MealTiming || current.mealTiming
    }, { emitEvent: false });
    this.suggestions[index] = [];
    this.focusedSuggestion[index] = -1;
  }

  private patchInitialData(data: any, preserveIdentity = false): void {
    const currentValues = this.form.getRawValue();
    const appointment = this.appointment;
    const appointmentId = !preserveIdentity && appointment?.id
      ? appointment.id
      : data.appointmentId;
    const patientId = !preserveIdentity && appointment?.patientId
      ? appointment.patientId
      : data.patientId;
    const doctorId = !preserveIdentity && appointment?.doctorId
      ? appointment.doctorId
      : data.doctorId;

    this.appointmentId.set(appointmentId);
    this.form.patchValue({
      id: preserveIdentity ? data.id ?? data.medicalRecordId ?? currentValues.id : null,
      appointmentId,
      patientId,
      doctorId,
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

    const prescription = data.prescriptions ?? data.Prescriptions ?? null;
    if (prescription) {
      this.patchPrescriptionForm(prescription, preserveIdentity);
    }
  }

  private patchPrescriptionForm(data: any[], preserveIdentity = true) {

  console.log('All prescriptions:', data);

  const internalPrescription = data.find(
    (p: any) => p.type === 'Internal'
  );

  const medicalStorePrescription = data.find(
    (p: any) => p.type === 'MedicalStore'
  );

  const internalItems =
    this.prescriptionForm.get('internalItems') as FormArray;

  const externalItems =
    this.prescriptionForm.get('externalItems') as FormArray;

  internalItems.clear();
  externalItems.clear();
this.prescriptionForm.patchValue({

    // Prescription ID
    internalPrescriptionId:
      preserveIdentity ? internalPrescription?.id ?? null : null,

    externalPrescriptionId:
      preserveIdentity ? medicalStorePrescription?.id ?? null : null,

    // Common information
    medicalRecordId: preserveIdentity
      ? internalPrescription?.medicalRecordId ??
        medicalStorePrescription?.medicalRecordId ??
        null
      : null,

    patientId:
      internalPrescription?.patientId ??
      medicalStorePrescription?.patientId ??
      null,

    doctorId:
      internalPrescription?.doctorId ??
      medicalStorePrescription?.doctorId ??
      null
  });

  // ==========================================
  // INTERNAL PRESCRIPTION
  // ==========================================

  if (internalPrescription) {

    const items =
      internalPrescription.prescriptionItemRequests ?? [];

    console.log('Internal items:', items);

    items.forEach((item: any) => {

      internalItems.push(
        this.createPrescriptionItem({
          id: preserveIdentity ? item.id : null,
          medicineName: item.medicineName,
          dosage: item.dosage,
          frequency: item.frequency,
          duration: item.duration,
          mealTiming: item.mealTiming
        })
      );

    });
  }


  // ==========================================
  // MEDICAL STORE PRESCRIPTION
  // ==========================================

  if (medicalStorePrescription) {

    const items =
      medicalStorePrescription.prescriptionItemRequests ?? [];

    console.log('Medical Store items:', items);

    items.forEach((item: any) => {

      externalItems.push(
        this.createPrescriptionItem({
          id: preserveIdentity ? item.id : null,
          medicineName: item.medicineName,
          dosage: item.dosage,
          frequency: item.frequency,
          duration: item.duration,
          mealTiming: item.mealTiming
        })
      );

    });
  }


  // ==========================================
  // DEFAULT ROW
  // ==========================================

  if (internalItems.length === 0) {
    internalItems.push(this.createPrescriptionItem());
  }

  if (externalItems.length === 0) {
    externalItems.push(this.createPrescriptionItem());
  }


  // ==========================================
  // DEFAULT ACTIVE TAB
  // ==========================================

  if (internalPrescription) {

    this.prescriptionForm.patchValue({
      id: preserveIdentity ? internalPrescription.id : null,
      medicalRecordId: preserveIdentity ? internalPrescription.medicalRecordId : null,
      patientId: internalPrescription.patientId,
      doctorId: internalPrescription.doctorId,
      type: 'Internal',
      instructions: internalPrescription.instructions ?? '',
      appointmentDate: internalPrescription.appointmentDate
        ? this.formatDate(internalPrescription.appointmentDate)
        : this.getMinDate()
    });

  }
  else if (medicalStorePrescription) {

    this.prescriptionForm.patchValue({
      id: preserveIdentity ? medicalStorePrescription.id : null,
      medicalRecordId: preserveIdentity ? medicalStorePrescription.medicalRecordId : null,
      patientId: medicalStorePrescription.patientId,
      doctorId: medicalStorePrescription.doctorId,
      type: 'MedicalStore',
      instructions: medicalStorePrescription.instructions ?? '',
      appointmentDate: medicalStorePrescription.appointmentDate
        ? this.formatDate(medicalStorePrescription.appointmentDate)
        : this.getMinDate()
    });

  }

  this.attachAutocompleteToIndex(0);
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

  private getPatientId(): string | null {
    return this.form.get('patientId')?.value || this.appointment?.patientId || this.initialData?.patientId || null;
  }

  private setAllergies(record: any): void {
    const allergies = record?.allergies ?? record?.Allergies ?? record?.patientAllergies ?? record?.PatientAllergies;
    if (Array.isArray(allergies)) {
      this.allergies = this.normalizeAllergies(allergies);
    }
  }

  private normalizeAllergies(allergies: unknown[]): any[] {
    return allergies
      .filter(allergy => {
        if (typeof allergy === 'string') return !!allergy.trim();
        const allergyName = (allergy as any)?.allergyName || (allergy as any)?.AllergyName;
        return !!allergyName?.trim();
      })
      .map(allergy => {
        if (typeof allergy === 'string') {
          return { allergyName: allergy };
        }
        return allergy;
      });
  }

  private updateAllergiesFromResponse(response: any): void {
    const data = response?.data;
    const allergies = Array.isArray(data)
      ? data
      : data?.allergies ?? data?.Allergies ?? data?.patientAllergies ?? data?.PatientAllergies;

    if (Array.isArray(allergies)) {
      this.allergies = allergies.map((allergy: any) => ({
        id: allergy.id ?? allergy.Id,
        patientId: allergy.patientId ?? allergy.PatientId,
        allergyName: allergy.allergyName ?? allergy.AllergyName
      }));
    }
  }

  addAllergy(): void {
    const patientId = this.getPatientId();
    const allergyName = this.allergyControl.value.trim();
    if (!patientId || !allergyName || this.allergyActionInProgress()) {
      return;
    }

    this.allergyActionInProgress.set(true);
    this.medicalRecordService.addAllergy({ patientId, allergyName }).pipe(
      finalize(() => this.allergyActionInProgress.set(false))
    ).subscribe({
      next: response => {
        this.updateAllergiesFromResponse(response);
        this.allergyControl.reset();
        this.toastr.success(response?.message || 'Allergy added successfully.', 'Success');
      },
      error: () => this.toastr.error('Unable to add allergy.', 'Error')
    });
  }

 removeAllergy(allergy: any): void {
  const patientId = this.getPatientId();
  const allergyId = allergy?.id ?? allergy?.Id;

  if (!patientId || !allergyId || this.allergyActionInProgress()) {
    return;
  }

  this.allergyActionInProgress.set(true);

  this.medicalRecordService
    .removeAllergy({
      allergyId,
      patientId
    })
    .pipe(
      finalize(() => this.allergyActionInProgress.set(false))
    )
    .subscribe({
      next: response => {
        if (response?.isSuccess) {
          this.updateAllergiesFromResponse(response);

          this.toastr.success(
            response?.message || 'Allergy removed successfully.',
            'Success'
          );
        } else {
          this.toastr.warning(
            response?.message || 'Patient allergy not found.',
            'Warning'
          );
        }
      },

      error: error => {
        console.error('Remove allergy error:', error);

        this.toastr.error(
          error?.error?.message || 'Unable to remove allergy.',
          'Error'
        );
      }
    });
}

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const medicalRecord = this.form.getRawValue();
    const prescription = this.prescriptionForm.getRawValue();
    const activeItems = (prescription.type === 'MedicalStore' ? prescription.externalItems : prescription.internalItems)
      .filter((item: any) => item?.medicineName?.trim());

    this.formSubmit.emit({
      medicalRecord,
      prescription: {
        ...prescription,
        items: activeItems,
        internalItems: (prescription.internalItems || []).filter((item: any) => item?.medicineName?.trim()),
        externalItems: (prescription.externalItems || []).filter((item: any) => item?.medicineName?.trim())
      }
    });
  }

  saveAndComplete() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const medicalRecord = this.form.getRawValue();
    const prescription = this.prescriptionForm.getRawValue();
    const activeItems = (prescription.type === 'MedicalStore' ? prescription.externalItems : prescription.internalItems)
      .filter((item: any) => item?.medicineName?.trim());

    this.formSubmit.emit({
      medicalRecord: { ...medicalRecord, isComplete: true },
      prescription: {
        ...prescription,
        items: activeItems,
        internalItems: (prescription.internalItems || []).filter((item: any) => item?.medicineName?.trim()),
        externalItems: (prescription.externalItems || []).filter((item: any) => item?.medicineName?.trim())
      }
    });
  }
  DuplicateRecord(recordId: string | null) {
    if (!recordId) {
      console.error('No record ID provided for duplication.');
      return;
    }

    this.medicalRecordService.getMedicalRecordForEdit(recordId).subscribe({
      next: res => {
        this.initialData = res.data;
        this.patchInitialData(res.data, this.isEdit);
        this.toastr.success(res.message || 'Record loaded into the form.', 'Success');
      },
      error: () => {
        this.toastr.error('Unable to load the medical record.');
      }
    });
  }
}

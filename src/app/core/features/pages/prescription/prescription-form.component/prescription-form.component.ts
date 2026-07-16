import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, inject, OnDestroy, ChangeDetectorRef, computed } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { PrescriptionService } from '../../../../services/prescription.service';
import { of, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError, map } from 'rxjs/operators';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../services/auth.services';

@Component({
  selector: 'app-prescription-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './prescription-form.component.html',
  styleUrl: './prescription-form.component.css',
})
export class PrescriptionFormComponent implements OnInit, OnChanges, OnDestroy {

  private fb = inject(FormBuilder);
  private prescriptionService = inject(PrescriptionService);
  private auth = inject(AuthService);
  role = computed(() => this.auth.user()?.role);
  @Input() initialData: any = null;
  @Input() record: any = null;
  @Input() isEdit = false;
  @Input() isReceptionist = false;
  @Input() patients: any[] = [];
  @Input() doctors: any[] = [];

  @Output() formSubmit = new EventEmitter<any>();
  @Output() markAsComplete = new EventEmitter<void>();

  errorMessage = '';
  selectedTab: 'MedicalStore' | 'Internal' = 'Internal';
  
  private typeSub?: Subscription;

  // minimum selectable date (today) in yyyy-MM-dd for input[type=date]
  minDate: string = (() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  })();

  constructor(
    private cdr: ChangeDetectorRef
  ) { }

  // ngOnInit() {
  //   this.typeSub = this.form.get('type')?.valueChanges.subscribe(() => {
  //     this.updateItemValidators();
  //   });
    
  // }


ngOnInit(): void {
  this.form.patchValue({
    appointmentDate: this.minDate,
    type: this.selectedTab
  });

  this.ensureOneRowPerTab();

  this.typeSub = this.form.get('type')?.valueChanges.subscribe(value => {
    this.selectedTab = value === 'Internal' ? 'Internal' : 'MedicalStore';
    this.ensureOneRowPerTab();
    this.updateItemValidators();
  });
}

get isInternalPrescription(): boolean {
  return this.initialData?.type === 'Internal';
}

get isExternalPrescription(): boolean {
  return this.initialData?.type === 'MedicalStore';
}

  updateItemValidators() {
    const isInternal = this.form.get('type')?.value === 'Internal';
    this.items.controls.forEach((group: any) => {
      const dosageControl = group.get('dosage');
      const durationControl = group.get('duration');

      if (dosageControl && durationControl) {
        if (isInternal) {
          dosageControl.clearValidators();
          durationControl.clearValidators();
        } else {
          dosageControl.setValidators([Validators.required]);
          durationControl.setValidators([Validators.required]);
        }
        dosageControl.updateValueAndValidity();
        durationControl.updateValueAndValidity();
      }
    });
    this.cdr.detectChanges();
  }
  form = this.fb.group({
    id: [null],
    medicalRecordId: [''],
    patientId: ['', Validators.required],
    doctorId: ['', Validators.required],
    type: ['Internal'],
    instructions: [''],

    appointmentDate: [this.minDate],

    internalItems: this.fb.array([]),
    externalItems: this.fb.array([])
  });

  // suggestions per row key
  suggestions: { [key: string]: any[] } = {};
  // focused suggestion index per row key for keyboard navigation
  focusedSuggestion: { [key: string]: number } = {};
  // subscriptions for each row key
  private rowSubs: { [key: string]: Subscription } = {};

  // 👉 Active FormArray for the selected tab
  get items(): FormArray {
    return this.selectedTab === 'Internal'
      ? (this.form.get('internalItems') as FormArray)
      : (this.form.get('externalItems') as FormArray);
  }

  getRowKey(index: number) {
    return `${this.selectedTab}-${index}`;
  }

  private getItemsArray(tab: 'Internal' | 'MedicalStore' = this.selectedTab): FormArray {
    return tab === 'Internal'
      ? (this.form.get('internalItems') as FormArray)
      : (this.form.get('externalItems') as FormArray);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['record']?.currentValue) {
      this.patchFromRecord(changes['record'].currentValue);
    }

    if (changes['initialData']?.currentValue) {
      const data = changes['initialData'].currentValue;

      console.log('Incoming edit data:', data);

      // ✅ Patch basic fields
      const typeValue = data.type === 'MedicalStore' ? 'MedicalStore' : 'Internal';
      this.selectedTab = typeValue;

      this.form.patchValue({
        id: data.id,
        medicalRecordId: data.medicalRecordId,
        patientId: data.patientId,
        doctorId: data.doctorId,
        type: typeValue,
        instructions: data.instructions,
        appointmentDate: data.appointmentDate ? this.formatToInputDate(data.appointmentDate) : this.minDate
      });

      // 🔥 IMPORTANT: clear old rows
      (this.form.get('internalItems') as FormArray).clear();
      (this.form.get('externalItems') as FormArray).clear();

      // ✅ FIX: map correct property
      const items = data.items || data.prescriptionItemRequests || [];
      const targetArray = this.selectedTab === 'Internal'
        ? (this.form.get('internalItems') as FormArray)
        : (this.form.get('externalItems') as FormArray);

      items.forEach((item: any) => {
        targetArray.push(this.createItem({
          medicineName: item.medicineName,
          dosage: item.dosage,
          frequency: item.frequency,
          duration: item.duration,
          mealTiming: item.mealTiming
        }));
        this.attachAutocompleteToIndex(targetArray.length - 1);
      });

      // fallback
      if (items.length === 0) {
        this.addItem();
      }
    }
  }

  private patchFromRecord(record: any) {
    if (!record) return;

    this.form.patchValue({
      medicalRecordId: record.id ?? record.Id ?? '',
      patientId: record.patientId ?? record.PatientId ?? '',
      doctorId:
        record.doctorId ??
        record.DoctorId ??
        (this.auth.user()?.role === 'Doctor' ? this.auth.user()?.id : '') ??
        '',
    });
  }

  private formatToInputDate(value: any) {
    if (!value) return this.minDate;
    const d = new Date(value);
    if (isNaN(d.getTime())) return this.minDate;
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  }

  private minDateValidator(minDate: string) {
    return (control: AbstractControl): ValidationErrors | null => {
      const v = control.value;
      if (!v) return null;
      // control value expected as yyyy-mm-dd
      if (v >= minDate) return null;
      return { minDate: { requiredMin: minDate, actual: v } };
    };
  }

get familyHistory() {
    return this.parseFamilyHistory(this.record);
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

  createItem(data: any = {}) {
    const isInternal = this.form?.get('type')?.value === 'Internal';
    return this.fb.group({
      medicineName: [data.medicineName || '', Validators.required],
      dosage: [data.dosage || '', isInternal ? [] : Validators.required],
      frequency: [data.frequency || 3],
      duration: [data.duration || '', isInternal ? [] : Validators.required],
      mealTiming: [data.mealTiming || 'After Meal']
    });
  }

  setTab(tab: 'Internal' | 'MedicalStore') {
    this.selectedTab = tab;
    this.form.patchValue({ type: tab });
    this.ensureOneRowPerTab();
    this.updateItemValidators();
  }

  ensureOneRowPerTab() {
    const internalArray = this.form.get('internalItems') as FormArray;
    const externalArray = this.form.get('externalItems') as FormArray;
    if (internalArray.length === 0) {
      internalArray.push(this.createItem());
      this.attachAutocompleteToIndex(0, 'Internal');
    }
    if (externalArray.length === 0) {
      externalArray.push(this.createItem());
      this.attachAutocompleteToIndex(0, 'MedicalStore');
    }
  }

  addItem() {
    if (!this.items.valid) {
      this.errorMessage = 'Please fill in all current medicine details before adding a new one.';
      this.items.markAllAsTouched();
      return;
    }
    this.errorMessage = '';
    this.items.push(this.createItem());
    this.attachAutocompleteToIndex(this.items.length - 1);
  }

  // private parseFamilyHistory(record: any) {
  //   const raw = record?.geneticFrom || record?.GeneticFrom || record?.genetic || '';
  //   const lines = raw
  //     .toString()
  //     .split(/\r?\n/)
  //     .map((line: string) => line.trim())
  //     .filter(Boolean);

  //   const history = {
  //     parents: '',
  //     grandparents: ''
  //   };

  //   for (const line of lines) {
  //     const normalized = line.replace(/\s+/g, ' ').trim();
  //     const value = normalized.replace(/^[^:]+:\s*/i, '');

  //     if (/grand\s*parents?/i.test(normalized)) {
  //       history.grandparents = value;
  //     } else if (/parents?/i.test(normalized)) {
  //       history.parents = value;
  //     }
  //   }

  //   if (!history.parents && lines.length > 0 && !history.grandparents) {
  //     history.parents = lines.join(' | ');
  //   }

  //   return history;
  // }



  // ✅ Quick Add
  quickAdd(med: any) {
    const emptyRow = this.items.controls.find(
      c => !c.value.medicineName
    );

    if (emptyRow) {
      emptyRow.patchValue(med);
    } else {
      this.items.push(this.createItem(med));
      this.attachAutocompleteToIndex(this.items.length - 1);
    }
  }

  private attachAutocompleteToIndex(index: number, tab?: 'Internal' | 'MedicalStore') {
    const effectiveTab = tab ?? this.selectedTab;
    const rowKey = `${effectiveTab}-${index}`;

    // cleanup old subscription
    if (this.rowSubs[rowKey]) {
      this.rowSubs[rowKey].unsubscribe();
    }

    const control =
      (this.getItemsArray(effectiveTab).at(index) as FormGroup)
        .get('medicineName');

    if (!control) return;

    const sub = control.valueChanges.pipe(

      debounceTime(300),

      distinctUntilChanged(),

      switchMap((term: any) => {

        const q = (term || '')
          .toString()
          .trim();

        // clear if less than 2 chars
        if (q.length < 2) {
          setTimeout(() => {
            this.suggestions[rowKey] = [];
            this.focusedSuggestion[rowKey] = -1;
            this.cdr.detectChanges();
          });
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
      setTimeout(() => {
        this.suggestions[rowKey] = [...list];
        this.focusedSuggestion[rowKey] = -1;
        this.cdr.detectChanges();
      });
    });

    this.rowSubs[rowKey] = sub;
  }

  onMedicineKeydown(
    event: KeyboardEvent,
    index: number
  ) {

    const rowKey = this.getRowKey(index);
    const list = this.suggestions[rowKey];

    if (!list || list.length === 0) return;

    const current = this.focusedSuggestion[rowKey] ?? -1;

    // ARROW DOWN
    if (event.key === 'ArrowDown') {

      event.preventDefault();

      setTimeout(() => {

        if (current < list.length - 1) {
          this.focusedSuggestion[this.getRowKey(index)] =
            current + 1;

          this.cdr.detectChanges();
        }

      });
    }

    // ARROW UP
    else if (event.key === 'ArrowUp') {

      event.preventDefault();

      setTimeout(() => {

        if (current > 0) {
          this.focusedSuggestion[this.getRowKey(index)] =
            current - 1;

          this.cdr.detectChanges();
        }

      });
    }

    // ENTER
    else if (event.key === 'Enter') {

      event.preventDefault();

      if (
        current >= 0 &&
        current < list.length
      ) {
        this.selectMedicine(
          index,
          list[current]
        );
      }
    }

    // ESCAPE
    else if (event.key === 'Escape') {
      const rowKey = this.getRowKey(index);
      setTimeout(() => {
        this.suggestions[rowKey] = [];
        this.focusedSuggestion[rowKey] = -1;
        this.cdr.detectChanges();
      });
    }
  }

  selectMedicine(index: number, med: any) {
    const rowKey = this.getRowKey(index);
    const grp = this.items.at(index) as FormGroup;

    if (!grp) return;

    grp.patchValue({

      medicineName: med.name || med.Name || '',

      dosage: med.dosage || med.Dosage || grp.value.dosage,

      frequency: med.frequency || med.Frequency || grp.value.frequency,

      duration: med.duration || med.Duration || grp.value.duration,

      mealTiming: med.mealTiming || med.MealTiming || grp.value.mealTiming

    }, {
      emitEvent: false
    });

    this.suggestions[rowKey] = [];
    this.focusedSuggestion[rowKey] = -1;

    this.cdr.detectChanges();
  }

  // cleanup when removing rows or destroying component
  private cleanupRow(index: number) {
    const rowKey = this.getRowKey(index);
    if (this.rowSubs[rowKey]) {
      this.rowSubs[rowKey].unsubscribe();
      delete this.rowSubs[rowKey];
    }
    delete this.suggestions[rowKey];
    delete this.focusedSuggestion[rowKey];
  }

  removeItem(index: number) {
    const rowKey = this.getRowKey(index);
    if (this.rowSubs[rowKey]) {
      this.rowSubs[rowKey].unsubscribe();
      delete this.rowSubs[rowKey];
    }
    delete this.suggestions[rowKey];
    delete this.focusedSuggestion[rowKey];
    this.items.removeAt(index);

    const oldKeyPrefix = `${this.selectedTab}-`;
    const newRowSubs: { [key: string]: Subscription } = {};
    const newSuggestions: { [key: string]: any[] } = {};
    const newFocused: { [key: string]: number } = {};
    for (let k = 0; k < this.items.length + 1; k++) {
      const oldKey = `${oldKeyPrefix}${k}`;
      if (oldKey === rowKey) continue;
      const newIndex = k > index ? k - 1 : k;
      const newKey = `${oldKeyPrefix}${newIndex}`;
      if (this.rowSubs[oldKey]) newRowSubs[newKey] = this.rowSubs[oldKey];
      if (this.suggestions[oldKey]) newSuggestions[newKey] = this.suggestions[oldKey];
      if (typeof this.focusedSuggestion[oldKey] !== 'undefined') newFocused[newKey] = this.focusedSuggestion[oldKey];
    }
    this.rowSubs = { ...this.rowSubs, ...newRowSubs };
    this.suggestions = { ...this.suggestions, ...newSuggestions };
    this.focusedSuggestion = { ...this.focusedSuggestion, ...newFocused };
  }



  ngOnDestroy() {
    Object.values(this.rowSubs).forEach(s => s.unsubscribe());
    this.typeSub?.unsubscribe();
  }

 submit() {

  const internalItems = (this.form.get('internalItems') as FormArray)
    .getRawValue()
    .filter((item: any) => item.medicineName?.trim());

  const externalItems = (this.form.get('externalItems') as FormArray)
    .getRawValue()
    .filter((item: any) => item.medicineName?.trim());

  if (this.isEdit) {

    this.formSubmit.emit({
      ...this.form.getRawValue(),
      items: this.selectedTab === 'Internal'
        ? internalItems
        : externalItems
    });

    return;
  }

  // Create mode
  this.formSubmit.emit({
    ...this.form.getRawValue(),
    internalItems,
    externalItems
  });
}
}
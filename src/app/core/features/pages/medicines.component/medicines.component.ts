import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AgGridAngular } from 'ag-grid-angular';
import {
  trigger,
  transition,
  style,
  animate
} from '@angular/animations';
import { firstValueFrom } from 'rxjs';
import { MedicinesService, MedicinesRequestModel } from '../../../services/medicines.service';
import { ToastService } from '../../../services/toast.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-medicines.component',
  imports: [AgGridAngular, CommonModule, ReactiveFormsModule],
  templateUrl: './medicines.component.html',
  styleUrl: './medicines.component.css',
  host: {
    '(document:keydown.escape)': 'handleEsc()'
  },
  animations: [
    trigger('backdropFade', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0 }))
      ])
    ]),
    trigger('modalZoom', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.9)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0, transform: 'scale(0.9)' }))
      ])
    ])
  ]
})
export class MedicinesComponent implements OnInit {
  private medicinesService = inject(MedicinesService);
  private toastr = inject(ToastService);
  private fb = inject(FormBuilder);

  // Signals
  showModal = signal(false);
  showEditModal = signal(false);
  isLoading = signal(false);
  selectedMedicine = signal<any>(null);
  selectedFiles = signal<File[]>([]);
  editSelectedFile = signal<File | null>(null);
  /** User picks one path: single record or optional bulk CSV */
  createMode = signal<'manual' | 'bulk'>('manual');
  medicineForm!: FormGroup;
  editMedicineForm!: FormGroup;

  // Computed
  isEditMode = computed(() => !!this.selectedMedicine());
  formTitle = computed(() => 
    this.isEditMode() ? 'Edit Medicine' : 'Add Medicine'
  );
  columnDefs = [
    {
      headerName: 'Medicine Name',
      flex: 1,
      valueGetter: (params: any) =>
        `${params.data.name}`
    },
    { field: 'dosage', headerName: 'Dosage', flex: 1 },
    { field: 'frequency', headerName: 'Frequency', flex: 1 },
    { field: 'duration', headerName: 'Duration', flex: 1 },
    { field: 'mealTiming', headerName: 'Meal Timing', flex: 1 },
    {
      headerName: 'Actions',
      flex: 1.2,
      cellRenderer: () => `
      <button class="btn btn-sm btn-primary me-1 action-edit">
        <i class="fa fa-edit"></i>
      </button>
      <button class="btn btn-sm btn-danger action-delete">
        <i class="fa fa-trash"></i>
      </button>
    `
    }
  ];
  rowData = signal<any[]>([]);

  constructor() {
    this.initializeForms();
  }

  ngOnInit() {
    this.getMedicines();
  }

  private initializeForms(): void {
    this.medicineForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      dosage: ['', [Validators.required, Validators.minLength(1)]],
      frequency: [1, [Validators.required, Validators.min(1)]],
      duration: ['', [Validators.required, Validators.minLength(1)]],
      mealTiming: ['', Validators.required]
    });

    this.editMedicineForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      dosage: ['', [Validators.required, Validators.minLength(1)]],
      frequency: [1, [Validators.required, Validators.min(1)]],
      duration: ['', [Validators.required, Validators.minLength(1)]],
      mealTiming: ['', Validators.required]
    });
  }

  onCellClicked(event: any) {
    if (!event.event.target) return;

    const target = event.event.target.closest('button');
    if (!target) return;
    const data = event.data;

    if (target.classList.contains('action-edit')) {
      this.openEditModal(data);
    }

    if (target.classList.contains('action-delete')) {
      this.deleteMedicineWithAlert(data.id);
    }
  }

  openModal() {
    this.selectedMedicine.set(null);
    this.createMode.set('manual');
    this.clearBulkFiles();
    this.medicineForm.reset();
    this.showModal.set(true);
  }

  closeModal() {
    if (this.isLoading()) return;
    this.showModal.set(false);
    this.createMode.set('manual');
    this.medicineForm.reset();
    this.clearBulkFiles();
  }

  setCreateMode(mode: 'manual' | 'bulk') {
    if (this.isLoading()) return;
    this.createMode.set(mode);
    if (mode === 'manual') {
      this.clearBulkFiles();
    } else {
      this.medicineForm.reset();
    }
  }

  private clearBulkFiles() {
    this.selectedFiles.set([]);
    const fileInput = document.getElementById('bulkUpload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  private isSameFile(a: File, b: File): boolean {
    return a.name === b.name && a.size === b.size && a.lastModified === b.lastModified;
  }

  closeEditModal() {
    if (this.isLoading()) return;
    this.showEditModal.set(false);
    this.selectedMedicine.set(null);
    this.editMedicineForm.reset();
    this.clearEditFile();
  }

  handleEsc() {
    if (this.showModal()) {
      this.closeModal();
    } else if (this.showEditModal()) {
      this.closeEditModal();
    }
  }

  onCreateBackdropClick() {
    this.closeModal();
  }

  onEditBackdropClick() {
    this.closeEditModal();
  }

  stopPropagation(event: Event) {
    event.stopPropagation();
  }

  openEditModal(medicine: any) {
    this.clearEditFile();
    this.selectedMedicine.set(medicine);
    this.editMedicineForm.patchValue({
      name: medicine.name,
      dosage: medicine.dosage,
      frequency: medicine.frequency,
      duration: medicine.duration,
      mealTiming: medicine.mealTiming
    });
    this.showEditModal.set(true);
  }

  getMedicines() {
    this.isLoading.set(true);
    this.medicinesService.getAllMedicines().subscribe({
      next: (res: any) => {
        this.rowData.set(res.data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  onCreateSubmit() {
    if (this.createMode() !== 'manual' || this.medicineForm.invalid) return;

    this.isLoading.set(true);
    const formData = this.medicineForm.value;
    const request: MedicinesRequestModel = {
      medicine: {
        name: formData.name,
        dosage: formData.dosage,
        frequency: formData.frequency,
        mealTiming: formData.mealTiming,
        duration: formData.duration
      },
      excelBase64: null
    };
    this.medicinesService.createMedicine(request).subscribe({
      next: (res: any) => {
        if (res.isSuccess) {
          this.toastr.success(res.message, 'Success');
          this.getMedicines();
          this.closeModal();
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (!files?.length) return;

    const current = [...this.selectedFiles()];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!current.some(f => this.isSameFile(f, file))) {
        current.push(file);
      }
    }
    this.selectedFiles.set(current);
    input.value = '';
  }

  onEditFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (files?.length) {
      this.editSelectedFile.set(files[0]);
      input.value = '';
    }
  }

  removeFile(file: File) {
    this.selectedFiles.set(this.selectedFiles().filter(f => !this.isSameFile(f, file)));
  }

  removeEditFile() {
    this.clearEditFile();
  }

  private clearEditFile() {
    this.editSelectedFile.set(null);
    const fileInput = document.getElementById('editBulkUpload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  /** Matches API: Convert.FromBase64String → Encoding.UTF8.GetString */
  private fileToExcelBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const bytes = new Uint8Array(reader.result as ArrayBuffer);
        let binary = '';
        for (let i = 0; i < bytes.length; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        resolve(btoa(binary));
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });
  }

  async uploadBulkMedicines() {
    if (this.createMode() !== 'bulk') return;

    const files = this.selectedFiles();
    if (!files.length) {
      this.toastr.warning('Please select at least one CSV file to upload', 'Warning');
      return;
    }

    this.isLoading.set(true);
    let successCount = 0;
    const failedNames: string[] = [];

    try {
      for (const file of files) {
        const excelBase64 = await this.fileToExcelBase64(file);
        const request: MedicinesRequestModel = {
          medicine: null,
          excelBase64
        };

        try {
          const res = await firstValueFrom(this.medicinesService.createMedicine(request));
          if (res.isSuccess) {
            successCount++;
          } else {
            failedNames.push(file.name);
          }
        } catch {
          failedNames.push(file.name);
        }
      }

      this.isLoading.set(false);

      if (successCount > 0) {
        const label = successCount === 1 ? 'file' : 'files';
        this.toastr.success(`Uploaded ${successCount} ${label} successfully.`, 'Success');
        this.getMedicines();
        this.closeModal();
      }

      if (failedNames.length > 0) {
        this.toastr.warning(
          `Failed to upload: ${failedNames.join(', ')}`,
          'Warning'
        );
      }
    } catch {
      this.isLoading.set(false);
      this.toastr.error('Error processing files', 'Error');
    }
  }

  async onEditSubmit() {
    if (this.editMedicineForm.invalid) return;

    this.isLoading.set(true);
    const medicine = this.selectedMedicine();
    const formData = this.editMedicineForm.value;
    const request: MedicinesRequestModel = {
      medicine: {
        name: formData.name,
        dosage: formData.dosage,
        frequency: formData.frequency,
        mealTiming: formData.mealTiming,
        duration: formData.duration
      },
      excelBase64: null
    };

    const file = this.editSelectedFile();
    if (file) {
      try {
        request.excelBase64 = await this.fileToExcelBase64(file);
      } catch {
        this.isLoading.set(false);
        this.toastr.error('Error processing file', 'Error');
        return;
      }
    }

    this.updateMedicine(medicine.id, request);
  }

  updateMedicine(id: string, request: MedicinesRequestModel) {
    this.medicinesService.updateMedicine(id, request).subscribe({
      next: (res: any) => {
        this.toastr.success(res.message, "Success");
        this.getMedicines();
        this.closeEditModal();
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    })
  }

  deleteMedicineWithAlert(id: string) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this medicine!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!',
      backdrop: true,
      allowOutsideClick: false
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteMedicine(id);
      }
    });
  }

  deleteMedicine(id: string) {
    this.isLoading.set(true);
    this.medicinesService.deleteMedicine(id).subscribe({
      next: (res: any) => {
        if (res.isSuccess) {
          Swal.fire('Deleted!', 'Medicine has been deleted.', 'success');
          this.getMedicines();
        } else {
          this.toastr.warning(res.message, "Warning");
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    })
  }
}

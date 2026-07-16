import { Component, Input, Output, EventEmitter, inject, OnInit, OnChanges, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../services/auth.services';
import { PatientService } from '../../../../services/patient.service';
import { environment } from '../../../../environment/environment';
import { ToastService } from '../../../../services/toast.service';

@Component({
  selector: 'app-patient-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './patient-form-component.html',
})
export class PatientFormComponent implements OnInit, OnChanges {

  private fb = inject(FormBuilder);
  private patientService = inject(PatientService);
  private toastr = inject(ToastService);
  auth = inject(AuthService);

  @Input() initialData: any = null;
  @Input() isEdit = false;
  @Input() doctors: any[] = [];

  @Output() formSubmit = new EventEmitter<any>();
  @Output() newDiseaseAdded = new EventEmitter<string>();

  showModal = signal(false);
  geneticDiseases = signal<Array<{ id: string; name: string; color?: string }>>([]);
  selectedGeneticDiseases = signal<Array<{ id: string; name: string; medicines: string; color?: string }>>([]);
  documents = signal<Array<{
    id?: string;
    clientKey?: string;
    originalName: string;
    savedName?: string;
    contentType: string;
    contentBase64?: string;
    reading?: boolean;
    fileSize?: number;
  }>>([]);
  deletedDocumentIds: string[] = [];
  geneticInput = signal('');
  NewDisease = signal('');
  // Options for the geneticFrom field and selected values
  geneticFromOptions = signal<Array<{ id: string; name: string }>>([
    { id: 'parents', name: 'Parents' },
    { id: 'grandparents', name: 'Grand Parents' }
  ]);
  // store selected sources along with optional details
  selectedGeneticFrom = signal<Array<{ name: string; value: string }>>([]);


  form = this.fb.group({
    id: [''],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    dateOfBirth: ['', Validators.required],
    gender: ['', Validators.required],
    bloodGroup: [''],
    geneticFrom: [''],
    geneticDiseases: [''],
    phone: ['', [Validators.required, Validators.minLength(10)]],
    address: [''],
    doctorId: [''],
    weight: [''],
    height: [''],
    bloodPressure: [''],
    sugarBeforeMeal: [''],
    sugarAfterMeal: [''],
    reason: ['']
  });

  ngOnInit() {
    this.loadGeneticDiseases();
    this.applyInitialData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['initialData'] && this.initialData) {
      this.applyInitialData();
    }
  }

  private applyInitialData() {
    if (!this.initialData) return;

    // normalize id into form control (API may return Id or id)
    const idVal = this.initialData.id || this.initialData.Id || '';
    if (idVal) this.form.get('id')?.setValue(idVal);

    const normalizedData = {
      firstName: this.initialData.firstName || this.initialData.FirstName || '',
      lastName: this.initialData.lastName || this.initialData.LastName || '',
      dateOfBirth: this.initialData.dateOfBirth || this.initialData.DateOfBirth || '',
      gender: this.initialData.gender || this.initialData.Gender || '',
      bloodGroup: this.initialData.bloodGroup || this.initialData.BloodGroup || '',
      geneticFrom: this.initialData.geneticFrom || this.initialData.GeneticFrom || '',
      phone: this.initialData.phone || this.initialData.Phone || '',
      address: this.initialData.address || this.initialData.Address || '',
      doctorId: this.initialData.doctorId || this.initialData.DoctorId || '',
      weight: this.initialData.weight || this.initialData.Weight || '',
      height: this.initialData.height || this.initialData.Height || '',
      bloodPressure: this.initialData.bloodPressure || this.initialData.BloodPressure || '',
      sugarBeforeMeal: this.initialData.sugarBeforeMeal || this.initialData.SugarBeforeMeal || '',
      sugarAfterMeal: this.initialData.sugarAfterMeal || this.initialData.SugarAfterMeal || '',
      reason: this.initialData.reason || this.initialData.Reason || ''
    };

    this.form.patchValue(normalizedData);

    // populate geneticFrom selection if provided
    const gf = normalizedData.geneticFrom || '';
    if (typeof gf === 'string' && gf.trim()) {
      const parts = (gf || '').split(/\r?\n|,\s*/).filter(Boolean);
      const objs = parts.map((p: any) => {
        const [namePart, ...rest] = p.split(':');
        const name = (namePart || '').trim();
        const value = rest.join(':').trim();
        return { name, value };
      });
      this.selectedGeneticFrom.set(objs);
      this.form.get('geneticFrom')?.setValue(objs.map((o: any) => `${o.name} : ${o.value}`).join('\n'));
    }

    // populate genetic diseases selection
    const gVal = this.initialData.geneticDiseases || this.initialData.GeneticDiseases || [];
    if (Array.isArray(gVal) && gVal.length > 0) {
      const selected = gVal.map((item: any) => ({
        id: String(item.geneticDiseaseId ?? item.GeneticDiseaseId ?? ''),
        name: item.diseaseName ?? item.DiseaseName ?? '',
        medicines: item.medicines ?? item.Medicines ?? '',
        color: item.colorCode ?? item.ColorCode ?? ''
      }));
      this.selectedGeneticDiseases.set(selected);
      const names = selected.map(d => d.name).filter(Boolean).join(', ');
      this.geneticInput.set(names);
      this.form.get('geneticDiseases')?.setValue(names);
    } else if (typeof gVal === 'string' && gVal.trim()) {
      const parts = gVal.split(/,\s*/).filter(Boolean);
      this.selectedGeneticDiseases.set(parts.map(name => ({ id: '', name, medicines: '', color: '' })));
      this.geneticInput.set(gVal);
      this.form.get('geneticDiseases')?.setValue(gVal);
    }

    // populate existing documents if any (show filenames)
    const docs = this.initialData.documents || this.initialData.Documents || this.initialData.patientReportDocs || [];
    if (Array.isArray(docs) && docs.length > 0) {
      const mapped = docs.map((d: any) => {
        const addr = d.docAddress || d.DocAddress || d.address || d.url || '';
        const savedName = addr ? addr.split(/[\\/]/).pop() : undefined;
        const original = d.fileName || d.originalName || d.name || (savedName || 'file');
        return {
          id: d.id || d.Id,
          originalName: original,
          savedName: savedName,
          contentType: d.contentType || d.docType || d.DocType || '',
          contentBase64: d.contentBase64 || ''
        };
      });
      this.documents.set(mapped);
    }
  }

loadGeneticDiseases() {
  this.patientService.getGeneticDiseases().subscribe({
    next: (res: any) => {
      const diseases = res.data.map((d: any) => ({
        id: String(d.id),
        name: d.diseaseName,
        color: d.colorCode
      }));

      this.geneticDiseases.set(diseases);

      // Re-apply colors to selected diseases
      this.selectedGeneticDiseases.update(selected =>
        selected.map(s => ({
          ...s,
          color: diseases.find((d: { id: string; name: string; color?: string }) => d.id === s.id)?.color ?? s.color
        }))
      );
    }
  });
}

  get f() {
    return this.form.controls;
  }

  submit(bookAppointment = false) {

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const geneticPayload = this.selectedGeneticDiseases().map(disease => ({
      GeneticDiseaseId: (() => { const n = parseInt(disease.id as any, 10); return isNaN(n) ? null : n; })(),
      DiseaseName: disease.name,
      Medicines: disease.medicines || ''
    }));

    // assemble geneticFrom as single string (each entry on its own line)
    const geneticFromString = this.selectedGeneticFrom().map(i => `${i.name} : ${i.value}`).join('\n');

    this.form.get('geneticFrom')?.setValue(geneticFromString);

    this.formSubmit.emit({
      ...this.form.value,
      geneticFrom: geneticFromString,
      GeneticDiseases: geneticPayload,
      bookAppointment,
      documents: this.documents(),
      deletedDocumentIds: this.deletedDocumentIds
    });
  }

  toggleGeneticDisease(disease: { id: string; name: string; color?: string }) {
    const list = [...this.selectedGeneticDiseases()];
    const idx = list.findIndex(item => item.id === disease.id);
    if (idx > -1) {
      list.splice(idx, 1);
    } else {
      list.push({ id: disease.id, name: disease.name, medicines: '', color: disease.color || '' });
    }
    this.selectedGeneticDiseases.set(list);
    const text = list.map(item => item.name).join(', ');
    this.geneticInput.set(text);
    this.form.get('geneticDiseases')?.setValue(text);
  }

  // geneticFrom toggles
  toggleGeneticFrom(name: string) {
    const list = [...this.selectedGeneticFrom()];
    const idx = list.findIndex(item => item.name === name);
    if (idx > -1) {
      list.splice(idx, 1);
    } else {
      list.push({ name, value: '' });
    }
    this.selectedGeneticFrom.set(list);
    this.form.get('geneticFrom')?.setValue(list.map(i => `${i.name} : ${i.value}`).join('\n'));
  }

  isGeneticFromSelected(name: string): boolean {
    return this.selectedGeneticFrom().some(item => item.name === name);
  }

  updateGeneticFromValue(name: string, value: string) {
    this.selectedGeneticFrom.update(list => list.map(item => item.name === name ? { ...item, value } : item));
    const text = this.selectedGeneticFrom().map(i => `${i.name} : ${i.value}`).join('\n');
    this.form.get('geneticFrom')?.setValue(text);
  }

  isGeneticDiseaseSelected(disease: { id: string; name: string }): boolean {
    return this.selectedGeneticDiseases().some(item => item.id === disease.id);
  }

  updateSelectedDiseaseMedicines(diseaseId: string, medicines: string) {
    this.selectedGeneticDiseases.update(list =>
      list.map(item =>
        item.id === diseaseId ? { ...item, medicines } : item
      )
    );
  }

  removeSelectedGeneticDisease(diseaseId: string) {
    this.selectedGeneticDiseases.update(list => list.filter(item => item.id !== diseaseId));
    const text = this.selectedGeneticDiseases().map(item => item.name).join(', ');
    this.geneticInput.set(text);
    this.form.get('geneticDiseases')?.setValue(text);
  }

  getContrastColor(hex: string | undefined): string {
    if (!hex) return '#000';
    let c = hex.replace('#', '').trim();
    if (c.length === 3) c = c.split('').map(s => s + s).join('');
    if (c.length !== 6) return '#000';
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    // luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.6 ? '#000' : '#fff';
  }

  onGeneticInputChange(val: string) {
    this.geneticInput.set(val);
    this.form.get('geneticDiseases')?.setValue(val);
    if (!val || val.trim() === '') {
      this.selectedGeneticDiseases.set([]);
    }
  }

  handleFiles(files: FileList | null, input?: HTMLInputElement | null) {
    if (!files || files.length === 0) return;

    const current = [...this.documents()];
    const toRead: Array<{ file: File; clientKey: string }> = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isDuplicate = current.some(
        d =>
          !d.id &&
          d.originalName === file.name &&
          d.fileSize === file.size
      );
      if (isDuplicate) continue;

      const clientKey = `pending-${Date.now()}-${i}-${file.name}`;
      current.push({
        clientKey,
        originalName: file.name,
        contentType: file.type || '',
        fileSize: file.size,
        reading: true
      });
      toRead.push({ file, clientKey });
    }

    if (toRead.length === 0) {
      if (input) input.value = '';
      return;
    }

    this.documents.set(current);

    if (input) {
      input.value = '';
    }

    for (const { file, clientKey } of toRead) {
      this.readFileAsBase64(file)
        .then(({ contentType, contentBase64 }) => {
          this.documents.update(list =>
            list.map(d =>
              d.clientKey === clientKey
                ? { ...d, contentType, contentBase64, reading: false }
                : d
            )
          );
        })
        .catch(() => {
          this.documents.update(list => list.filter(d => d.clientKey !== clientKey));
        });
    }
  }

  private readFileAsBase64(file: File): Promise<{ contentType: string; contentBase64: string }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('File read error'));
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1] || '';
        resolve({ contentType: file.type || '', contentBase64: base64 });
      };
      reader.readAsDataURL(file);
    });
  }


  getFileUrl(savedName?: string) {
    if (!savedName) return '';
    const base = environment.base || '';
    return base + encodeURIComponent(savedName);
  }
  removeDocument(doc: { id?: string; clientKey?: string; originalName: string; savedName?: string; contentType: string; contentBase64?: string }) {
    if (doc.id && !this.deletedDocumentIds.includes(doc.id)) {
      this.deletedDocumentIds.push(doc.id);
    }
    this.documents.update(list => list.filter(d => d !== doc));
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

      // Use the central submit helper to ensure the same payload
      this.submit(true);

      return;
    }

    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  confirmBooking() {
    if (this.isEdit) return;

    // Submit using the same payload as regular Create, but request booking
    this.submit(true);
    this.closeModal();
  }
  addNewDisease() {
    const newDiseaseName = this.NewDisease().trim();
    if (!newDiseaseName) return;
    // First check disease name uniqueness (case-insensitive)
    const nameLower = newDiseaseName.toLowerCase();
    const nameExists = this.geneticDiseases().some(d => (d.name || '').toLowerCase() === nameLower);
    if (nameExists) {
      this.toastr.info('This disease already exists in the list.');
      return;
    }

    // Then generate a color and ensure the color is unique across existing diseases
    let color = this.generateRandomColor();
    while (this.geneticDiseases().some(d => (d.color || '').toLowerCase() === color.toLowerCase())) {
      color = this.generateRandomColor();
    }
this.patientService.CreateGeneticDisease({ diseaseName: newDiseaseName, colorCode: color }).subscribe({
      next: (res: any) => {
        if (res.isSuccess) {
          const created = res.data;
          const newDisease = { id: String(created.id), name: created.diseaseName, color: created.colorCode };
          this.geneticDiseases.update(list => [...list, newDisease]);
          this.toggleGeneticDisease(newDisease);
          this.NewDisease.set('');
          this.newDiseaseAdded.emit(created.diseaseName);
        }
      }
    });
   
  }

  private generateRandomColor(): string {
    // generate a hex color like #a1b2c3
    return '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');
  }
}
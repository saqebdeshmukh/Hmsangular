// create-patient.component.ts
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DestroyRef } from '@angular/core';

import { PatientFormComponent } from './patient-form-component';
import { PatientService } from '../../../../services/patient.service';
import { ToastService } from '../../../../services/toast.service';

@Component({
  selector: 'app-create-patient',
  standalone: true,
  imports: [PatientFormComponent],
  template: `
  <div class="row justify-content-center">
    <div class="col-lg-8">
        <div class="card shadow-sm">
            <div class="card-header bg-primary text-white">
                <h4 class="mb-0"><i class="bi bi-person-plus me-2"></i>Add New Patient</h4>
            </div>
            <div class="card-body p-4">

    <app-patient-form
      [doctors]="doctors()"
      (formSubmit)="handleCreate($event)">
    </app-patient-form>
            </div>
    </div>
</div>
</div>
  `
})
export class CreatePatientComponent {

  private service = inject(PatientService);
  private toastr = inject(ToastService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  doctors = signal<any[]>([]);

  ngOnInit() {
    this.service.doctorLookup()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => this.doctors.set(res.data || []));
  }

  handleCreate(data: any) {
    const sendDocs = (data.documents || [])
      .filter((d: any) => d.contentBase64)
      .map((d: any) => ({ FileName: d.originalName || d.fileName || 'file', ContentBase64: d.contentBase64, ContentType: d.contentType || '' }));

    const payload = {
      FirstName: data.firstName || data.FirstName || '',
      LastName: data.lastName || data.LastName || '',
      DateOfBirth: data.dateOfBirth || data.DateOfBirth || '',
      Gender: data.gender || data.Gender || '',
      Phone: data.phone || data.Phone || '',
      Address: data.address || data.Address || '',
      BloodGroup: data.bloodGroup || data.BloodGroup || '',
      DoctorId: data.doctorId || data.DoctorId || '',
      Weight: data.weight || data.Weight || '',
      Height: data.height || data.Height || '',
      BloodPressure: data.bloodPressure || data.BloodPressure || '',
      SugarBeforeMeal: data.sugarBeforeMeal || data.SugarBeforeMeal || '',
      SugarAfterMeal: data.sugarAfterMeal || data.SugarAfterMeal || '',
      Reason: data.reason || data.Reason || '',
      GeneticFrom: data.geneticFrom || data.GeneticFrom || '',
      GeneticDiseases: data.GeneticDiseases || data.geneticDiseases || [],
      Diabetic: data.diabetic || data.Diabetic || '',
      Hypertension: data.hypertension || data.Hypertension || '',
      BookAppointment: data.bookAppointment || false,
      Documents: sendDocs
    };

    this.service.createPatient(payload).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.router.navigate(['/patients']);          
        }
      }
    });
  }
}
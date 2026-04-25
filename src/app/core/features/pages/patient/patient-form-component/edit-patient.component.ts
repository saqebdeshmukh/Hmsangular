// edit-patient.component.ts
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DestroyRef } from '@angular/core';

import { PatientFormComponent } from './patient-form-component';
import { PatientService } from '../../../../services/patient.service';
import { ToastService } from '../../../../services/toast.service';

@Component({
  selector: 'app-edit-patient',
  standalone: true,
  imports: [PatientFormComponent],
  template: `
  <div class="row justify-content-center">
    <div class="col-lg-8">
        <div class="card shadow-sm">
            <div class="card-header bg-primary text-white">
                <h4 class="mb-0"><i class="bi bi-person-edit me-2"></i>Edit Patient</h4>
            </div>
            <div class="card-body p-4">
    @if (!patient()) {
      <p>Loading...</p>
    } @else {

      <app-patient-form
        [initialData]="patient()"
        [isEdit]="true"
        [doctors]="doctors()"
        (formSubmit)="handleUpdate($event)">
      </app-patient-form>
 
    }
    </div>
    </div>
</div>
</div>
  `
})
export class EditPatientComponent {

  private route = inject(ActivatedRoute);
  private service = inject(PatientService);
  private toastr = inject(ToastService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  patient = signal<any>(null);
  doctors = signal<any[]>([]);

  ngOnInit() {
    const id = (this.route.snapshot.paramMap.get('id'));

    if (!id) {
      this.router.navigate(['/patients']);
      return;
    }

    this.service.getPatientById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res: any) => {
        const data = res.data;
        if (data.dateOfBirth) {
         
          data.dateOfBirth = data.dateOfBirth.split('T')[0];
        }
        this.patient.set(res.data);
      });


  }

  handleUpdate(data: any) {
    this.service.updatePatient(data.id, data).subscribe({
      next: () => {
        this.toastr.success('Patient updated successfully');
        this.router.navigate(['/patients']);
      }
    });
  }
}
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MedicalRecordFormComponent } from './medical-record-form.component';
import { MedicalRecordService } from '../../../../services/medicarecord.service';
import { PrescriptionService } from '../../../../services/prescription.service';
import { ToastService } from '../../../../services/toast.service';
import { AppointmentService } from '../../../../services/appointment.service';
import { AppointmentStatus } from '../../appointmentStatus.enum';
import { AuthService } from '../../../../services/auth.services';

@Component({
  selector: 'app-edit-medical-record',
  standalone: true,
  imports: [MedicalRecordFormComponent],
  template: `
    @if (record()) {
  <app-medical-record-form
    [initialData]="record()"
    [medicalHistory]="medicalHistory()"
    [isEdit]="true"
    (formSubmit)="update($event)">
  </app-medical-record-form>
}
  `
})
export class EditMedicalRecordComponent {

  private route = inject(ActivatedRoute);
  private service = inject(MedicalRecordService);
  private prescriptionService = inject(PrescriptionService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private appointmentService = inject(AppointmentService);
  private auth = inject(AuthService);
  role = computed(() => this.auth.user()?.role);
medicalHistory = signal<any[]>([]);
  record = signal<any>(null);

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    this.service.getMedicalRecordForEdit(id).subscribe(res => {
      this.record.set(res.data);
      console.log('Fetched medical record for edit:', res.data);
      this.getMedicalHistory(res.data?.patientId);
      console.log('Fetched medical record for edit:', res.data);
    });
  }

  getMedicalHistory(patientId: string | null) {
  this.service.getMedicalHistory(patientId).subscribe({
    next: (response) => {
      if (response?.isSuccess) {
        this.medicalHistory.set(response.data || []);
      } else {
        this.medicalHistory.set([]);
      }
    },
    error: () => {
      this.medicalHistory.set([]);
    }
  });
}

  private buildPrescriptionPayload(data: any, medicalRecordId: number | string) {
    if (!data) {
      return null;
    }

    const internalItems = (data.internalItems || []).filter((item: any) => item?.medicineName?.trim());
    const externalItems = (data.externalItems || []).filter((item: any) => item?.medicineName?.trim());
    const commonData = {
      medicalRecordId,
      patientId: this.record()?.patientId,
      doctorId: this.record()?.doctorId,
      instructions: data.instructions,
      appointmentDate: data.appointmentDate,
      type: data.type
    };

    return {
      id: data.id ?? this.record()?.prescription?.id ?? null,
      medicalRecordId,
      patientId: this.record()?.patientId,
      doctorId: this.record()?.doctorId,
      instructions: data.instructions,
      appointmentDate: data.appointmentDate,
      type: data.type,
      prescriptionItemRequests: (data.type === 'MedicalStore' ? externalItems : internalItems).map((item: any) => ({
        id: item.id,
        medicineName: item.medicineName,
        dosage: item.dosage,
        frequency: item.frequency,
        duration: item.duration?.toString?.() ?? item.duration,
        mealTiming: item.mealTiming
      }))
    };
  }

  update(data: any) {

  const medicalRecord = data.medicalRecord;
  const prescription = data.prescription;

  const payload = {

    medicalRecordRequestModel: {
      id: medicalRecord.id,
      appointmentId: medicalRecord.appointmentId,
      patientId: medicalRecord.patientId,
      doctorId: medicalRecord.doctorId,
      visitDate: medicalRecord.visitDate,
      symptoms: medicalRecord.symptoms,
      diagnosis: medicalRecord.diagnosis,
      treatment: medicalRecord.treatment,
      notes: medicalRecord.notes,

      weight: medicalRecord.weight,
      height: medicalRecord.height,
      bloodPressure: medicalRecord.bloodPressure,
      sugarBeforeMeal: medicalRecord.sugarBeforeMeal,
      sugarAfterMeal: medicalRecord.sugarAfterMeal
    },

    prescriptionRequestModel: {

      internalPrescriptionRequest:
        prescription.internalItems?.some(
          (x: any) => x.medicineName?.trim()
        )
          ? {
              id: prescription.internalPrescriptionId,
              medicalRecordId: medicalRecord.id,
              patientId: medicalRecord.patientId,
              doctorId: medicalRecord.doctorId,
              instructions: prescription.instructions,
              type: 'Internal',
              appointmentDate: prescription.appointmentDate,

              prescriptionItemRequests:
                prescription.internalItems
                  .filter((x: any) => x.medicineName?.trim())
                  .map((item: any) => ({
                    id: item.id,
                    medicineName: item.medicineName,
                    dosage: item.dosage,
                    frequency: item.frequency,
                    mealTiming: item.mealTiming,
                    duration: item.duration?.toString()
                  }))
            }
          : null,


      externalPrescriptionRequest:
        prescription.externalItems?.some(
          (x: any) => x.medicineName?.trim()
        )
          ? {
              id: prescription.externalPrescriptionId,
              medicalRecordId: medicalRecord.id,
              patientId: medicalRecord.patientId,
              doctorId: medicalRecord.doctorId,
              instructions: prescription.instructions,
              type: 'MedicalStore',
              appointmentDate: prescription.appointmentDate,

              prescriptionItemRequests:
                prescription.externalItems
                  .filter((x: any) => x.medicineName?.trim())
                  .map((item: any) => ({
                    id: item.id,
                    medicineName: item.medicineName,
                    dosage: item.dosage,
                    frequency: item.frequency,
                    mealTiming: item.mealTiming,
                    duration: item.duration?.toString()
                  }))
            }
          : null
    }
  };

  console.log('FINAL UPDATE PAYLOAD:', payload);

  this.service
    .updateMedicalRecord(medicalRecord.id, payload)
    .subscribe({
      next: (res: any) => {

        if (res.isSuccess) {

          this.toast.success(
            res.message || 'Medical record updated successfully'
          );
this.appointmentService.updateAppointmentStatus(this.record()?.appointmentId, AppointmentStatus.Completed).subscribe(statusRes => {
            if (statusRes.isSuccess) {
              if (this.role() === 'Doctor') {
                this.router.navigate(['/doctordashboard']);
              } else {
                this.router.navigate(['/admin']);
              }
              return;
            }

            this.router.navigate(['/medical-records']);
          });
        } else {

          this.toast.error(
            res.message || 'Failed to update medical record'
          );
        }
      },

      error: () => {
        this.toast.error(
          'Failed to update medical record'
        );
      }
    });
}
}
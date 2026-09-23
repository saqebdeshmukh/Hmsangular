import { Component, computed, inject, signal } from '@angular/core';
import { MedicalRecordFormComponent } from './medical-record-form.component';
import { MedicalRecordService } from '../../../../services/medicarecord.service';
import { ToastService } from '../../../../services/toast.service';
import { AppointmentService } from '../../../../services/appointment.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AppointmentStatus } from '../../appointmentStatus.enum';
import { AuthService } from '../../../../services/auth.services';

@Component({
  selector: 'app-create-medical-record',
  standalone: true,
  imports: [MedicalRecordFormComponent, CommonModule],
  template: `
@if (appointment()) {
  <app-medical-record-form
    [appointment]="appointment()"
    [medicalHistory]="medicalHistory()"
    (formSubmit)="create($event)">
  </app-medical-record-form>
}
  `
})
export class CreateMedicalRecordComponent {

  private service = inject(MedicalRecordService);
  private toast = inject(ToastService);
  private appointmentService = inject(AppointmentService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private auth = inject(AuthService);
  role = computed(() => this.auth.user()?.role);
  appointment = signal<any>(null);
  medicalHistory = signal<any[]>([]);
appointmentId = signal<any | null>(null);
  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('appointmentId');
    if (id) {
      this.appointmentService.getAppointmentDetails(id).subscribe(res => {
        this.appointment.set(res.data);
        this.getMedicalHistory(res.data?.patientId);
      });
    }
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

  private buildPrescriptionPayload(data: any) {
    if (!data) {
      return {
        internalPrescriptionRequest: null,
        externalPrescriptionRequest: null
      };
    }

    const internalItems = (data.internalItems || []).filter((item: any) => item?.medicineName?.trim());
    const externalItems = (data.externalItems || []).filter((item: any) => item?.medicineName?.trim());
    const commonData = {
      medicalRecordId: null,
      patientId: this.appointment()?.patientId,
      doctorId: this.appointment()?.doctorId,
      instructions: data.instructions,
      appointmentDate: data.appointmentDate
    };

    return {
      internalPrescriptionRequest: internalItems.length ? {
        ...commonData,
        type: 'Internal',
        prescriptionItemRequests: internalItems.map((item: any) => ({
          medicineName: item.medicineName,
          dosage: item.dosage,
          frequency: item.frequency,
          duration: item.duration?.toString?.() ?? item.duration,
          mealTiming: item.mealTiming
        }))
      } : null,
      externalPrescriptionRequest: externalItems.length ? {
        ...commonData,
        type: 'MedicalStore',
        prescriptionItemRequests: externalItems.map((item: any) => ({
          medicineName: item.medicineName,
          dosage: item.dosage,
          frequency: item.frequency,
          duration: item.duration?.toString?.() ?? item.duration,
          mealTiming: item.mealTiming
        }))
      } : null
    };
  }

  create(data: any) {
    const appointment = this.appointment();
    const formMedicalRecord = data.medicalRecord ?? data;
    const medicalRecord = {
      ...formMedicalRecord,
      appointmentId: appointment?.id ?? formMedicalRecord.appointmentId,
      patientId: appointment?.patientId ?? formMedicalRecord.patientId,
      doctorId: appointment?.doctorId ?? formMedicalRecord.doctorId
    };

    const request = {
      medicalRecordRequestModel: {
        patientId: medicalRecord.patientId ?? '',
        doctorId: medicalRecord.doctorId ?? '',
        appointmentId: medicalRecord.appointmentId ?? '',
        weight: medicalRecord.weight,
        height: medicalRecord.height,
        bloodPressure: medicalRecord.bloodPressure,
        sugarAfterMeal: medicalRecord.sugarAfterMeal,
        sugarBeforeMeal: medicalRecord.sugarBeforeMeal,
        diagnosis: medicalRecord.diagnosis ?? '',
        symptoms: medicalRecord.symptoms ?? '',
        treatment: medicalRecord.treatment ?? '',
        notes: medicalRecord.notes ?? ''
      },
      prescriptionRequestModel: this.buildPrescriptionPayload(data.prescription)
    };

    this.service.createMedicalRecord(request).subscribe(res => {
      if (!res.isSuccess) {
        return;
      }

      const completeFlow = () => {
        this.toast.success(res.message || 'Medical record created successfully');

        if (medicalRecord.isComplete) {
          this.appointmentService.updateAppointmentStatus(this.appointment()?.id, AppointmentStatus.Completed).subscribe(statusRes => {
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
          return;
        }

        this.router.navigate(['/medical-records']);
      };

      completeFlow();
    });
  }
}
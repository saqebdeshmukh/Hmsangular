import { Component, inject, OnInit, signal } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { PrescriptionFormComponent } from "./prescription-form.component";
import { PrescriptionService } from "../../../../services/prescription.service";
import { MedicalRecordService } from "../../../../services/medicarecord.service";
import { ToastService } from "../../../../services/toast.service";
import { CommonModule } from "@angular/common";
import { AppointmentService } from "../../../../services/appointment.service";

@Component({
  standalone: true,
  imports: [PrescriptionFormComponent, CommonModule],
  template: `

  @if (record()) {

    <app-prescription-form
      [record]="record()"
      (formSubmit)="create($event)">
    </app-prescription-form>
    

  } @else {

    <div class="text-center mt-5">
      <div class="spinner-border text-info"></div>
      <p class="mt-2 text-muted">Loading medical record...</p>
    </div>

  }

  `
})
export class CreatePrescriptionComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(PrescriptionService);
  private recordService = inject(MedicalRecordService);
  private appointmentService = inject(AppointmentService);
  private toastr = inject(ToastService);

  // ✅ Angular signal
  record = signal<any>(null);

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const recordId = params.get('recordId');

      if (!recordId) {
        this.toastr.error('Invalid record');
        this.router.navigate(['/medical-records']);
        return;
      }

      this.loadMedicalRecord(recordId);
    });
  }
  loadMedicalRecord(recordId: string) {
    this.recordService.getMedicalRecordByIdForPres(recordId).subscribe({
      next: (res: any) => {
        if (res.isSuccess && res.data) {
          const record = Array.isArray(res.data) ? res.data[0] : res.data;
          this.record.set(record);
        } else {
          this.toastr.error('Record not found');
          this.router.navigate(['/medical-records']);
        }
      },
      error: () => {
        this.toastr.error('Failed to load record');
        this.router.navigate(['/medical-records']);
      }
    });
  }
  private shouldCreateAppointment(selectedDate: string | null | undefined): boolean {
    if (!selectedDate) return false;

    const today = new Date();
    const todayString = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 10);

    return selectedDate !== todayString;
  }

  create(data: any) {
    const internalItems = (data.internalItems || []).map((item: any) => ({
      ...item,
      duration: item.duration?.toString() ?? ''
    }));

    const externalItems = (data.externalItems || []).map((item: any) => ({
      ...item,
      duration: item.duration?.toString() ?? ''
    }));
    const commonData = {
      medicalRecordId: data.medicalRecordId || this.record()?.id,
      patientId:
        data.patientId ||
        this.record()?.patientId ||
        this.record()?.PatientId,

      doctorId:
        data.doctorId ||
        this.record()?.doctorId ||
        this.record()?.DoctorId,

      instructions: data.instructions,
      appointmentDate: data.appointmentDate
    };

    const payload = {
      InternalPrescriptionRequest:
        internalItems.length > 0
          ? {
              ...commonData,
              type: 'Internal',
              prescriptionItemRequests: internalItems
            }
          : null,

      ExternalPrescriptionRequest:
        externalItems.length > 0
          ? {
              ...commonData,
              type: 'MedicalStore',
              prescriptionItemRequests: externalItems
            }
          : null
    };

    this.service.createPrescription(payload).subscribe({
      next: (res: any) => {
        if (this.shouldCreateAppointment(data.appointmentDate)) {
          const appointmentPayload = {
            patientId: commonData.patientId,
            doctorId: commonData.doctorId,
            reason: 'Prescription follow-up',
            weight: '',
            height: '',
            bloodPressure: '',
            sugarBeforeMeal: '',
            sugarAfterMeal: '',
            appointmentDate: data.appointmentDate
          };

          this.appointmentService.createAppointment(appointmentPayload).subscribe({
            next: (appointmentRes: any) => {
              if (!appointmentRes.isSuccess) {
                this.toastr.error(appointmentRes.message || 'Failed to create appointment');
                return;
              }

              this.toastr.success(res.message || 'Prescription created successfully');
            },
            error: () => {
              this.toastr.error('Failed to create appointment');
            }
          });
        } else {
          this.toastr.success(res.message || 'Prescription created successfully');
        }

        res.data.internalId ? this.router.navigate(['/doctordashboard']) : window.open(`/prescriptionprint/${res.data.externalId}`, '_blank');
      },
      error: () => {
        this.toastr.error('Failed to create prescription');
      }
    });
  }
}
import { Component, DestroyRef, inject, Signal, signal } from "@angular/core";
import { PrescriptionFormComponent } from "./prescription-form.component";
import { PrescriptionService } from "../../../../services/prescription.service";
import { ToastService } from "../../../../services/toast.service";
import { ActivatedRoute, Router } from "@angular/router";
import { MedicalRecordService } from "../../../../services/medicarecord.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { AppointmentService } from "../../../../services/appointment.service";
import { AppointmentStatus } from "../../appointmentStatus.enum";

@Component({
  selector: 'app-edit-prescription',
  standalone: true,
  imports: [PrescriptionFormComponent],
  template: `
  @if (prescription()) {
    <app-prescription-form
      [initialData]="prescription()"
      [record]="prescription()?.medicalRecord"
      [isEdit]="true"
      (formSubmit)="update($event)"
       (markAsComplete)="markAsComplete()"
      >
    </app-prescription-form>
  }
  `
})
export class EditPrescriptionComponent {
  private route = inject(ActivatedRoute);
  private toastr = inject(ToastService);
  private router = inject(Router);
  prescription = signal<any>(null);
  private service = inject(PrescriptionService);
  private appointmentService = inject(AppointmentService);
  private destroyRef = inject(DestroyRef);
  appointmentId = signal<string>('');

  ngOnInit() {
    const id = (this.route.snapshot.paramMap.get('id'));

    if (!id) {
      this.router.navigate(['/prescriptions']);
      return;
    }

    this.service.getPrescriptionById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res: any) => {
        this.prescription.set(res.data);
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

  update(data: any) {

  const payload = {
    medicalRecordId: data.medicalRecordId,
    patientId: data.patientId,
    doctorId: data.doctorId,
    instructions: data.instructions,
    type: data.type,
    appointmentDate: data.appointmentDate,
    prescriptionItemRequests: data.items.map((item: any) => ({
      id: item.id,               // Include if editing existing items
      medicineName: item.medicineName,
      dosage: item.dosage,
      frequency: item.frequency,
      mealTiming: item.mealTiming,
      duration: item.duration?.toString()
    }))
  };

  this.service.updatePrescription(data.id, payload).subscribe({
    next: (res: any) => {
      if (this.shouldCreateAppointment(data.appointmentDate)) {
        const appointmentPayload = {
          patientId: data.patientId,
          doctorId: data.doctorId,
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

            this.toastr.success(res.message || 'Prescription updated successfully');
          },
          error: () => {
            this.toastr.error('Failed to create appointment');
          }
        });
      } else {
        this.toastr.success(res.message || 'Prescription updated successfully');
      }
    }
  });
}
  markAsComplete() {
    this.appointmentService.updateAppointmentStatus(this.prescription().appointmentId, AppointmentStatus.Completed).subscribe((res: any) => {
      this.toastr.success(res.message, 'Success');
      this.router.navigate(['/doctordashboard']);
    })
  }
}
import { Component, DestroyRef, inject, Signal, signal } from "@angular/core";
import { PrescriptionFormComponent } from "./prescription-form.component";
import { PrescriptionService } from "../../../../services/prescription.service";
import { ToastService } from "../../../../services/toast.service";
import { ActivatedRoute, Router } from "@angular/router";
import { MedicalRecordService } from "../../../../services/medicarecord.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { AppointmentService } from "../../../../services/appointment.service";

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

  update(data: any) {
    const payload = {
      ...data,
      prescriptionItemRequests: data.items.map((item: any) => ({
        ...item,
        duration: item.duration?.toString() // optional safety
      }))
    };

    delete payload.items;

    this.service.updatePrescription(data.id, payload).subscribe({
      next: (res: any) => {
        this.toastr.success(res.message || 'Prescription updated successfully');
      }
    });
  }
  markAsComplete() {
    this.appointmentService.completeAppointment(this.prescription().appointmentId, 'Completed').subscribe((res: any) => {
      this.toastr.success(res.message, 'Success');
      this.router.navigate(['/doctordashboard']);
    })
  }
}
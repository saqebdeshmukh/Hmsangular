import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MedicalRecordFormComponent } from './medical-record-form.component';
import { MedicalRecordService } from '../../../../services/medicarecord.service';
import { ToastService } from '../../../../services/toast.service';
import { AppointmentService } from '../../../../services/appointment.service';
import { AppointmentStatus } from '../../appointmentStatus.enum';

@Component({
  selector: 'app-edit-medical-record',
  standalone: true,
  imports: [MedicalRecordFormComponent],
  template: `
    @if (record()) {
  <app-medical-record-form
    [initialData]="record()"
    [isEdit]="true"
    (formSubmit)="update($event)">
  </app-medical-record-form>
}
  `
})
export class EditMedicalRecordComponent {

  private route = inject(ActivatedRoute);
  private service = inject(MedicalRecordService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private appointmentService = inject(AppointmentService);

  record = signal<any>(null);

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    this.service.getMedicalRecordForEdit(id).subscribe(res => {
      this.record.set(res.data);
    });
  }

  update(data: any) {
    this.service.updateMedicalRecord(data.id, data).subscribe(res => {
      if (!res.isSuccess) {
        return;
      }

      this.toast.success(res.message);

      if (data.isComplete) {
        this.appointmentService.updateAppointmentStatus(this.record()?.appointmentId, AppointmentStatus.Completed).subscribe(statusRes => {
          if (statusRes.isSuccess) {
            this.router.navigate(['/medical-records']);
            return;
          }

          this.router.navigate(['/medical-records']);
        });
        return;
      }

      this.router.navigate(['/medical-records']);
    });
  }
}
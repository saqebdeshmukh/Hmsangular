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

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('appointmentId');
    if (id) {
      this.appointmentService.getAppointmentDetails(id).subscribe(res => {

        this.appointment.set(res.data);
      });
    }
  }

  create(data: any) {
    data.appointmentId = this.appointment()?.id;
    data.patientId = this.appointment()?.patientId;
    data.doctorId = this.appointment()?.doctorId;

    this.service.createMedicalRecord(data).subscribe(res => {
      if (!res.isSuccess) {
        return;
      }

      this.toast.success(res.message);

      if (data.isComplete) {
        this.appointmentService.updateAppointmentStatus(this.appointment()?.id, AppointmentStatus.Completed).subscribe(statusRes => {
          if (statusRes.isSuccess) {
            if (this.role() === 'Doctor') {
              this.router.navigate(['/doctordashboard']);
            } else {
              this.router.navigate(['/admin']);
            }
            return;
          }

          this.router.navigate(['/prescription/create', res.data]);
        });
        return;
      }

      this.router.navigate(['/prescription/create', res.data]);
    });
  }
}
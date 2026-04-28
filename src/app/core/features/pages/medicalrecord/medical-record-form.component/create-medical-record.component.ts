import { Component, inject, signal } from '@angular/core';
import { MedicalRecordFormComponent } from './medical-record-form.component';
import { MedicalRecordService } from '../../../../services/medicarecord.service';
import { ToastService } from '../../../../services/toast.service';
import { AppointmentService } from '../../../../services/appointment.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-create-medical-record',
  standalone: true,
  imports: [MedicalRecordFormComponent,CommonModule],
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
  private router=inject(Router);

  appointment = signal<any>(null);

  ngOnInit() {
  const id = this.route.snapshot.paramMap.get('appointmentId');
  if (id) {
    this.appointmentService.getAppointmentDetails(id).subscribe(res => {
      
        console.log('Fetched appointment details:', res.data);
        this.appointment.set(res.data);
      console.log("Appointment data is ", res.data);
    });
  }
}

  create(data: any) {
    data.appointmentId = this.appointment()?.id; 
    data.patientId = this.appointment()?.patientId;
    data.doctorId = this.appointment()?.doctorId;
    console.log('Creating medical record with data:', data);
    this.service.createMedicalRecord(data).subscribe(res => {
      if (res.isSuccess) {
        this.toast.success(res.message);
        this.router.navigate(["/medical-records"])
      }
    });
  }
}
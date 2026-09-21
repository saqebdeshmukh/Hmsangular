import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AppointmentService } from '../../../../services/appointment.service';

@Component({
  selector: 'app-select-appointment',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './select-appointment.component.html'
})
export class SelectAppointmentComponent {

  private service = inject(AppointmentService);
  private router = inject(Router);

  appointments = signal<any[]>([]);

  ngOnInit() {
    this.service.getAppointmentsToSelect().subscribe(res => {
      console.log("appointment data is : ", res.data);
      this.appointments.set(res.data || []);
    });
  }

  selectAppointment(id: string) {
    this.router.navigate(['/medical-records/create', id]);
  }
}
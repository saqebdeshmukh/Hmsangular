import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';
import { AppointmentService } from '../../../../services/appointment.service';

@Component({
  selector: 'app-appointments.component',
  imports: [CommonModule, RouterModule],
  templateUrl: './appointments.component.html',
  styleUrl: './appointments.component.css',
})
export class AppointmentsComponent {
  private service = inject(AppointmentService);
  private destroyRef = inject(DestroyRef);

  todayAppointments = signal<any[]>([]);
  completedAppointments = signal<any[]>([]);
  appointments = signal<any[]>([]);
   upcomingAppointments = signal<any[]>([]);

  today = new Date();

  constructor() {
    this.loadAppointments();
  }

  loadAppointments() {
    this.service.getAppointments()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res: any) => {

        console.log('API:', res);

        const data = res?.data;

        // ✅ SAFE assignment
        this.todayAppointments.set(
          Array.isArray(data?.todayAppointments) ? data.todayAppointments : []
        );

        this.completedAppointments.set(
          Array.isArray(data?.completedAppointments) ? data.completedAppointments : []
        );

        this.appointments.set(
          Array.isArray(data?.appointments) ? data.appointments : []
        );
         this.upcomingAppointments.set(
          Array.isArray(data?.upcomingAppointments) ? data.upcomingAppointments : []
        );
      });
  }

  getStatusClass(status: string) {
    switch (status) {
      case 'Scheduled': return 'bg-warning text-dark';
      case 'Completed': return 'bg-success';
      case 'Cancelled': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }
}

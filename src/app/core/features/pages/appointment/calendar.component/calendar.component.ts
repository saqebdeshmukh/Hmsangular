import { Component, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentService } from '../../../../services/appointment.service';

interface Appointment {
  id: number;
  doctorId: number;
  patientName: string;
  doctorName: string;
  appointmentDate: string;
  status: string;
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar.component.html',
  styleUrl:'./calendar.component.css'
})
export class AppointmentCalendarComponent {

  private service = inject(AppointmentService);

  // 🔥 signals
  currentMonth = signal(new Date());
  appointments = signal<Appointment[]>([]);
  today = new Date();

  constructor() {
    this.loadAppointments();
  }

  // ✅ Load API data
  loadAppointments() {
    const month = this.currentMonth().getMonth() + 1;
    const year = this.currentMonth().getFullYear();

    this.service.getAppointmentCalednar(month,year)
      .subscribe(res => {
        if (res.isSuccess) {
          this.appointments.set(res.data);
        }
      });
  }

  // ✅ Month navigation
  changeMonth(offset: number) {
    const d = this.currentMonth();
    this.currentMonth.set(new Date(d.getFullYear(), d.getMonth() + offset, 1));

    this.loadAppointments(); // 🔥 reload API
  }

  // ✅ Computed values (same as before)
  firstDay = computed(() => {
    const d = this.currentMonth();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  lastDay = computed(() => {
    const d = this.firstDay();
    return new Date(d.getFullYear(), d.getMonth() + 1, 0);
  });

  startDate = computed(() => {
    const first = this.firstDay();
    return new Date(first.getFullYear(), first.getMonth(), 1 - first.getDay());
  });

  weeks = computed(() => {
    const weeks: Date[][] = [];
    const start = new Date(this.startDate());

    for (let w = 0; w < 6; w++) {
      const week: Date[] = [];

      for (let d = 0; d < 7; d++) {
        week.push(new Date(start));
        start.setDate(start.getDate() + 1);
      }

      weeks.push(week);

      if (start > this.lastDay() && w >= 3) break;
    }

    return weeks;
  });

  // ✅ Filter appointments per day
  getAppointments(date: Date) {
    return this.appointments().filter(a =>
      new Date(a.appointmentDate).toDateString() === date.toDateString()
    );
  }

  // ✅ Status styling
  getStatusClass(status: string) {
    switch (status) {
      case 'Scheduled': return 'bg-warning text-dark';
      case 'Completed': return 'bg-success text-white';
      case 'Cancelled': return 'bg-danger text-white';
      default: return 'bg-secondary text-white';
    }
  }
}
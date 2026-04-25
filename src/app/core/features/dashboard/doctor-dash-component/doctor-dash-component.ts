import { Component, inject, signal } from '@angular/core';
import { DashboardService } from '../../../services/dashboard.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-doctor-dash-component',
  imports: [CommonModule,RouterModule],
  templateUrl: './doctor-dash-component.html',
  styleUrl: './doctor-dash-component.css',
})
export class DoctorDashComponent {
  stats = signal<any>(null);
  todayAppointments = signal<any[]>([]);
  upcomingAppointments = signal<any[]>([]);
  loading = signal(true);
   dashboardService = inject(DashboardService)
  ngOnInit(): void {
    this.loadDashboard();
  }

  statsConfig = [
    {
      label: 'Total Appointments',
      key: 'totalAppointments',
      icon: 'fas fa-calendar-check',
      bg: '#E0E7FF',
      color: '#4F46E5'
    },
    {
      label: 'Pending',
      key: 'pendingAppointments',
      icon: 'fas fa-clock',
      bg: '#FEF3C7',
      color: '#D97706'
    },
    {
      label: 'Completed',
      key: 'completedAppointments',
      icon: 'fas fa-check-circle',
      bg: '#D1FAE5',
      color: '#059669'
    },
    {
      label: 'Patients Seen',
      key: 'totalPatientsSeenToday',
      icon: 'fas fa-users',
      bg: '#CFFAFE',
      color: '#0891B2'
    }
  ];

  loadDashboard() {

    this.dashboardService.getDoctorDashboardData().subscribe({
      next: (res:any) => {
        
        const data = res.data;

        this.stats.set(data);
        this.todayAppointments.set(data.todayAppointments || []);
        this.upcomingAppointments.set(data.upcomingAppointments || []);

      }
    });
  }
}

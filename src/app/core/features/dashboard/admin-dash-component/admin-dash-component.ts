import { Component, signal } from '@angular/core';
import { DashboardService } from '../../../services/dashboard.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-dash-component',
  imports: [CommonModule,RouterModule],
  templateUrl: './admin-dash-component.html',
  styleUrl: './admin-dash-component.css',
})
export class AdminDashComponent {
  stats = signal<any>(null);
  recentAppointments = signal<any[]>([]);
  loading = signal(true);

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadDashboard();
  }
// dashboard.component.ts

statsConfig = [
  {
    label: 'Total Patients',
    key: 'totalPatients',
    icon: 'fas fa-users',
    bg: '#E0E7FF',
    color: '#4F46E5',
    route: '/patients'
  },
  {
    label: 'Total Doctors',
    key: 'totalDoctors',
    icon: 'fas fa-user-md',
    bg: '#D1FAE5',
    color: '#059669',
    route: '/doctors'
  },
  {
    label: 'Appointments',
    key: 'totalAppointments',
    icon: 'fas fa-calendar-check',
    bg: '#CFFAFE',
    color: '#0891B2',
    route: '/appointments'
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
    label: 'Records',
    key: 'totalMedicalRecords',
    icon: 'fas fa-file-medical',
    bg: '#F3E8FF',
    color: '#7C3AED',
    route: '/records'
  }
];
  loadDashboard() {
    this.loading.set(true);

    this.dashboardService.getDashboardData().subscribe({
      next: (res) => {
        
        this.stats.set(res.data);
        this.recentAppointments.set(res.data.recentAppointments);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}

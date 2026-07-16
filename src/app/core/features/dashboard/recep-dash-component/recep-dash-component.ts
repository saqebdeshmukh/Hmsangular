import { Component, inject, signal } from '@angular/core';
import { DashboardService } from '../../../services/dashboard.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-recep-dash-component',
  imports: [CommonModule, RouterModule],
  templateUrl: './recep-dash-component.html',
  styleUrl: './recep-dash-component.css',
})
export class RecepDashComponent {
  private dashboardService = inject(DashboardService);
  private router = inject(Router);

  stats = signal<any>(null);
  todayAppointments = signal<any[]>([]);
  completedAppointments = signal<any[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.loadDashboard();
  }

  statsConfig = [
    {
      label: 'Total Appointments',
      key: 'totalAppointments',
      icon: 'fas fa-calendar-check',
      bg: '#E0E7FF',
      color: '#4F46E5',
      tab: 'all'
    },
    {
      label: 'Pending',
      key: 'pendingAppointments',
      icon: 'fas fa-clock',
      bg: '#FEF3C7',
      color: '#D97706',
      tab: 'upcoming'
    },
    {
      label: 'Completed',
      key: 'completedAppointments',
      icon: 'fas fa-check-circle',
      bg: '#D1FAE5',
      color: '#059669',
      tab: 'completed'
    }
  ];

  loadDashboard() {
    this.loading.set(true);

    this.dashboardService.getReceptionistDashboardData().subscribe({
      next: (res: any) => {
        const data = res.data;

        this.stats.set(data);
        this.todayAppointments.set(data.todayAppointments || []);
        this.completedAppointments.set(data.patientsSeenToday || []);

        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  getInitials(name: string) {
    if (!name) return '';
    const parts = name.split(' ');
    return parts.map(x => x[0]).join('').toUpperCase();
  }

  getStatusClass(status: string) {
    switch (status) {
      case 'Scheduled': return 'status-scheduled';
      case 'Completed': return 'status-completed';
      case 'Cancelled': return 'status-cancelled';
      case 'InProgress': return 'status-inprogress';
      case 'MedicalRecordCreated': return 'status-medicalrecordcreated';
      default: return 'bg-secondary';
    }
  }

  onStatCardClick(tab: string) {
    this.router.navigate(['/appointments'], { queryParams: { tab } });
  }
}

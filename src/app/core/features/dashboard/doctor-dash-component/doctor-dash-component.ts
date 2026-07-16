import { Component, inject, signal } from '@angular/core';
import { DashboardService } from '../../../services/dashboard.service';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AppointmentStatus } from '../../pages/appointmentStatus.enum';

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
  dashboardService = inject(DashboardService);
  router = inject(Router);
 AppointmentStatus = AppointmentStatus;
  ngOnInit(): void {
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
      tab: 'today'
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
    this.dashboardService.getDoctorDashboardData().subscribe({
      next: (res:any) => {
        
        const data = res.data;

        this.stats.set(data);
        this.todayAppointments.set(data.todayAppointments || []);
        this.upcomingAppointments.set(data.upcomingAppointments || []);

      }
    });
  }

  onStatCardClick(tab: string) {
    this.router.navigate(['/appointments'], { queryParams: { tab } });
  }

  redirectToContinuePage(appointmentId: string) {
    this.dashboardService.getIdToRedirect(appointmentId).subscribe({
      next: (res:any) => {
        const data = res.data;
        if (res.isSuccess) {
          if(data.status === AppointmentStatus.InProgress){
            this.router.navigate(['/medical-records/create', data.id]);
          } else if(res.data.status === AppointmentStatus.MedicalRecordCreated){
            this.router.navigate(['/prescription/create', data.id]);
          }
        } else {
          console.error('Redirect URL not found in the response.');
        }
      },
      error: (err) => {
        console.error('Error fetching redirect URL:', err);
      }
    })
    
  }
}

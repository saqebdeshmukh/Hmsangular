import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AppointmentService } from '../../../../services/appointment.service';
import { ToastService } from '../../../../services/toast.service';

@Component({
  selector: 'app-appointment-details.component',
  imports: [CommonModule, RouterModule],
  templateUrl: './appointment-details.component.html',
  styleUrl: './appointment-details.component.css',
})
export class AppointmentDetailsComponent {
  private service = inject(AppointmentService);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);
private toastr = inject(ToastService);
  appointment = signal<any>(null);

  // ✅ Role from localStorage (since no session in Angular)
  role = signal<string>(localStorage.getItem('role') || '');

  isAdmin = computed(() => this.role() === 'Admin');
  isDoctor = computed(() => this.role() === 'Doctor');

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadDetails(id);
  }

  loadDetails(id: string) {
    this.service.getAppointmentDetails(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res: any) => {
        this.appointment.set(res?.data ?? null);
      });
  }

  getStatusClass(status: string) {
    switch (status) {
      case 'Scheduled': return 'bg-warning text-dark';
      case 'Completed': return 'bg-success text-white';
      case 'Cancelled': return 'bg-danger text-white';
      default: return 'bg-secondary text-white';
    }
  }

  getInitials(name: string) {
    if (!name) return '';
    return name.split(' ').map(x => x[0]).join('').toUpperCase();
  }

  deleteAppointment(id: string) {
    if (!confirm('Are you sure you want to delete this appointment?')) return;

    this.service.deleteAppointment(id).subscribe((res:any) => {
      this.loadDetails(id);
      this.toastr.success(res.message || 'Appointment deleted successfully', 'Success');
    });
  }

  completeAppointment(id: string) {
    this.service.completeAppointment(id, 'Completed').subscribe((res:any ) => {
      this.loadDetails(id);
      this.toastr.success(res.message || 'Appointment completed successfully', 'Success');
    });
  }
}

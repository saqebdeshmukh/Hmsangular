import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { PatientService } from '../../../../services/patient.service';
import { AppointmentModalComponent } from '../appointment-modal.component/appointment-modal.component';
import { AppointmentService } from '../../../../services/appointment.service';
import { AuthService } from '../../../../services/auth.services';
import { ToastService } from '../../../../services/toast.service';

@Component({
  selector: 'app-patient-detail',
  standalone: true,
  imports: [CommonModule, AppointmentModalComponent],
  templateUrl: './patient-details.component.html',
  styleUrl: './patient-details.component.css',
})
export class PatientDetailComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private patientService = inject(PatientService);
  private appointmentService = inject(AppointmentService);
  private auth = inject(AuthService);
  private toastr = inject(ToastService);

  patient = signal<any>(null);
  role = computed(() => this.auth.user()?.role);

  showModal = signal(false);
  doctors = signal<any[]>([]);
  selectedDoctor = signal('');
  reason = signal('');

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.getPatient(id);

    this.getDoctors();
  }

  truncate(text: string | null | undefined, limit: number): string {
    if (!text) return 'N/A';
    return text.length > limit ? text.substring(0, limit) + '...' : text;
  }

  calculateAge(dateOfBirth: string | Date | null | undefined): number {
    if (!dateOfBirth) return 0;

    const dob = new Date(dateOfBirth);
    const today = new Date();

    let age = today.getFullYear() - dob.getFullYear();

    const monthDiff = today.getMonth() - dob.getMonth();

    // If birthday hasn't occurred yet this year → subtract 1
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < dob.getDate())
    ) {
      age--;
    }

    return age;
  }
  goPatients() {
    this.router.navigate(['/patients']);
  }

  getPatient(id: string) {
    this.patientService.getPatientDetails(id).subscribe((res: any) => {
      this.patient.set(res.data);
    });
  }

  getDoctors() {
    this.patientService.doctorLookup().subscribe((res: any) => {
      this.doctors.set(res.data);
    });
  }

  get age() {
    const dob = new Date(this.patient()?.dateOfBirth);
    return new Date().getFullYear() - dob.getFullYear();
  }

  getStatusClass(status: string) {
    switch (status) {
      case 'Scheduled': return 'bg-warning text-dark';
      case 'Completed': return 'bg-success';
      case 'Cancelled': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  openModal() {
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  handleBooking(data: any) {
    this.appointmentService.createAppointment(data).subscribe({
      next: (res: any) => {
        //this.selectedPatientId.set('');
        if (!res.isSuccess) {
          this.toastr.error(res.message || 'Something went wrong', 'Error');
          this.closeModal();
          return;
        }

        this.toastr.success(res.message || 'Appointment booked successfully', 'Success');
        this.closeModal();
        this.getPatient(this.patient().id);
      }
    });
  }
  activeTab = 'appointments';



  errorMessage = signal('');

  print(id: string) {
    this.router.navigate(['/prescriptionprint', id])
  }



  viewAppointment(id: string) {
    this.router.navigate(['/appointmentDetails', id]);
  }

  viewRecord(id: string) {
    this.router.navigate(['/medical-records/details', id]);
  }

  viewPrescription(id: string) {
    this.router.navigate(['/prescription', id]);
  }
}
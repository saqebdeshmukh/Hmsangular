import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { PatientService } from '../../../../services/patient.service';
import { AppointmentModalComponent } from '../appointment-modal.component/appointment-modal.component';
import { AppointmentService } from '../../../../services/appointment.service';

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

  patient = signal<any>(null);
  role = signal(localStorage.getItem('role'));

  showModal = signal(false);
  doctors = signal<any[]>([]);
  selectedDoctor = signal('');
  reason = signal('');

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.getPatient(id);

    this.getDoctors();
  }

  getPatient(id: string) {
    this.patientService.getPatientById(id).subscribe((res: any) => {
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
  this.appointmentService.createAppointment(data).subscribe(() => {
    this.closeModal();

    // 🔥 optional: refresh patient data
    this.getPatient(this.patient().id);
  });
}


  viewAppointment(id: string) {
    this.router.navigate(['/appointment', id]);
  }

  viewRecord(id: string) {
    this.router.navigate(['/medical-record', id]);
  }

  viewPrescription(id: string) {
    this.router.navigate(['/prescription', id]);
  }
}
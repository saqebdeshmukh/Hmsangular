import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { PatientService } from '../../../../services/patient.service';
import { MedicalRecordService } from '../../../../services/medicarecord.service';
import { PrescriptionService } from '../../../../services/prescription.service';
import { AppointmentModalComponent } from '../appointment-modal.component/appointment-modal.component';
import { AppointmentService } from '../../../../services/appointment.service';
import { AuthService } from '../../../../services/auth.services';
import { ToastService } from '../../../../services/toast.service';
import { environment } from '../../../../environment/environment';

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
  private medicalRecordService = inject(MedicalRecordService);
  private prescriptionService = inject(PrescriptionService);
  private appointmentService = inject(AppointmentService);
  private auth = inject(AuthService);
  private toastr = inject(ToastService);

  patient = signal<any>(null);
  role = computed(() => this.auth.user()?.role);

  showModal = signal(false);
  doctors = signal<any[]>([]);
  medicalRecords = signal<any[]>([]);
  prescriptions = signal<any[]>([]);
  selectedDoctor = signal('');
  reason = signal('');
    documents = signal<Array<{
    id?: string;
    clientKey?: string;
    originalName: string;
    savedName?: string;
    contentType: string;
    contentBase64?: string;
    reading?: boolean;
    fileSize?: number;
  }>>([]);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.getPatient(id);
    
  }

  truncate(text: string | null | undefined, limit: number): string {
    if (!text) return 'N/A';
    return text.length > limit ? text.substring(0, limit) + '...' : text;
  }
  goPatients() {
    this.router.navigate(['/patients']);
  }

  getPatient(id: string) {
    this.patientService.getPatientDetails(id).subscribe((res: any) => {
      this.patient.set(res.data);
      const docs = res.data?.patientReportDocs || [];
    if (Array.isArray(docs) && docs.length > 0) {
      const mapped = docs.map((d: any) => {
        const addr = d.docAddress || d.DocAddress || d.address || d.url || '';
        const savedName = addr ? addr.split(/[\\/]/).pop() : undefined;
        const original = d.fileName || d.originalName || d.name || (savedName || 'file');
        return {
          id: d.id || d.Id,
          originalName: original,
          savedName: savedName,
          contentType: d.contentType || d.docType || d.DocType || '',
          contentBase64: d.contentBase64 || ''
        };
      });
      this.documents.set(mapped);
    }
  
    });
  }
getFileUrl(savedName?: string) {
    if (!savedName) return '';
    const base = environment.base || '';
    return base + encodeURIComponent(savedName);
  }
  getDoctors() {
    this.patientService.doctorLookup().subscribe((res: any) => {
      this.doctors.set(res.data);
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

  openModal() {
    this.getDoctors();
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  handleBooking(data: any) {
    this.appointmentService.createAppointment(data).subscribe({
      next: (res: any) => {
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
    this.router.navigate(['/prescriptiondetails', id]);
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
    const id = this.patient()?.id || this.route.snapshot.paramMap.get('id');
    if (!id) return;

    if (tab === 'records') {
      this.medicalRecordService.getMedicalRecordsByPatientId(id).subscribe({
        next: (res: any) => {
          this.medicalRecords.set(res?.data || []);
        },
        error: () => {
          this.errorMessage.set('Failed to load medical records');
        }
      });
    }

    if (tab === 'prescriptions') {
      this.prescriptionService.getPrescriptionsByPatientId(id).subscribe({
        next: (res: any) => {
          // Do not overwrite the main patient signal when loading prescriptions.
          // The API may return either an array or an object with a `prescriptions` field.
          const data = res?.data;
          if (Array.isArray(data)) {
            this.prescriptions.set(data);
          } else if (data && Array.isArray(data.prescriptions)) {
            this.prescriptions.set(data.prescriptions);
          } else {
            this.prescriptions.set([]);
          }
        },
        error: () => {
          this.errorMessage.set('Failed to load prescriptions');
        }
      });
    }
  }
}
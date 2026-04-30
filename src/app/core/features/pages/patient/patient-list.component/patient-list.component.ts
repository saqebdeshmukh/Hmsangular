import { Component, computed, inject, signal } from '@angular/core';
import { PatientService } from '../../../../services/patient.service';
import { AuthService } from '../../../../services/auth.services';
import { AgGridAngular } from 'ag-grid-angular';
import { ToastService } from '../../../../services/toast.service';
import { Router, RouterModule } from '@angular/router';
import { AppointmentModalComponent } from '../appointment-modal.component/appointment-modal.component';
import { AppointmentService } from '../../../../services/appointment.service';

@Component({
  selector: 'app-patient-list.component',
  imports: [AgGridAngular, AppointmentModalComponent, RouterModule],
  templateUrl: './patient-list.component.html',
  styleUrl: './patient-list.component.css',
})
export class PatientListComponent {
  private patientService = inject(PatientService);
  private appointmentService = inject(AppointmentService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private toastr = inject(ToastService);
  showModal = signal(false);
  doctors = signal<any[]>([]);
  patientDetails = signal<any>(null);
  role = computed(() => this.auth.user()?.role);
  columnDefs = [
    {
      headerName: 'Patient Name',
      flex: 1,
      valueGetter: (params: any) =>
        `${params.data.firstName} ${params.data.lastName}`
    },
    { field: 'phone', headerName: 'Phone', flex: 1 },
    {
      field: 'dateOfBirth',
      headerName: 'Date of Birth',
      flex: 1,
      valueFormatter: (params: any) => {
        if (!params.value) return '';

        const date = new Date(params.value);

        return date.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });
      }
    },
    { field: 'gender', headerName: 'Gender', flex: 1 },
    {
      field: 'bloodGroup',
      headerName: 'Blood Group',
      flex: 1,
      cellRenderer: (params: any) => {
        return params.value
          ? `<span class="badge bg-danger">${params.value}</span>`
          : `<span class="text-muted">—</span>`;
      }
    },
    {
      headerName: 'Actions',
      flex: 1.2,
      cellRenderer: () => `
      <button class="btn btn-sm btn-info me-1 action-view">
        <i class="fa fa-eye"></i>
      </button>
      <button class="btn btn-sm btn-primary me-1 action-edit">
        <i class="fa fa-edit"></i>
      </button>
      <button class="btn btn-sm btn-success action-book">
        <i class="fa fa-calendar-plus"></i>
      </button>
    `
    }
  ];
  rowData = signal<any[]>([]);

  onCellClicked(event: any) {

    if (!event.event.target) return;

    const target = event.event.target.closest('button');
    if (!target) return;
    const data = event.data;
    

    if (target.classList.contains('action-view')) {
      this.router.navigate(['/patientdetails', data.id]);
    }

    if (target.classList.contains('action-edit')) {
      this.router.navigate(['/patients/edit', data.id]);
    }

    if (target.classList.contains('action-book')) {
      this.getPatientById(data.id);
      this.getDoctors();

      this.openModal();

      
     // var obj = { patientId: data.id, doctorId: this.doctors()[0].id }
      //this.handleBooking(obj);
    }
  }

  ngOnInit() {
    this.getPatients();
  }
   getPatientById(id: string) {
    this.patientService.getPatientById(id).subscribe((res: any) => {
      this.patientDetails.set(res.data);
    })
  }
  openModal() {

    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }
  getPatients() {
    this.patientService.getAllPatients().subscribe({
      next: (res: any) => {
        this.rowData.set(res.data);
      }
    });
  }
 
  getDoctors() {
    this.patientService.doctorLookup().subscribe((res: any) => {
      this.doctors.set(res.data);
    });
  }

  handleBooking(data: any) {
    this.appointmentService.createAppointment(data).subscribe({
      next: (res: any) => {
        //this.selectedPatientId.set('');
        if (!res.isSuccess) {
          this.toastr.error(res.message || 'Something went wrong', 'Error');
          return;
        }

        this.toastr.success(res.message || 'Appointment booked successfully', 'Success');
        this.closeModal();
      }

    });
  }

}

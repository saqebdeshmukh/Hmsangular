import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AgGridAngular } from 'ag-grid-angular';

import { PatientService } from '../../../../services/patient.service';
import { AppointmentService } from '../../../../services/appointment.service';
import { AuthService } from '../../../../services/auth.services';
import { ToastService } from '../../../../services/toast.service';

import { AppointmentModalComponent } from '../appointment-modal.component/appointment-modal.component';
import { BaseGridComponent } from '../../../../GridRequestResponse/BaseGridComponent';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [
    AgGridAngular,
    RouterModule,
    AppointmentModalComponent
  ],
  templateUrl: './patient-list.component.html',
  styleUrl: './patient-list.component.css'
})
export class PatientListComponent extends BaseGridComponent {

  private patientService = inject(PatientService);
  private appointmentService = inject(AppointmentService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private toastr = inject(ToastService);

  role = computed(() => this.auth.user()?.role);

  rowData = signal<any[]>([]);

  showModal = signal(false);

  doctors = signal<any[]>([]);

  patientDetails = signal<any>(null);

  constructor() {
    super();
  }

  columnDefs = [

    {
      field: 'patientId',
      headerName: 'Patient ID',
      sortable: true,
      flex: 1
    },

    {
      field: 'firstName',
      colId: 'firstName',
      headerName: 'Patient Name',
      sortable: true,
      flex: 1,
      valueGetter: (params: any) =>
        `${params.data.firstName} ${params.data.lastName}`
    },

    {
      field: 'phone',
      headerName: 'Phone',
      sortable: true,
      flex: 1
    },

    {
      field: 'dateOfBirth',
      headerName: 'Date of Birth',
      sortable: true,
      flex: 1,
      valueFormatter: (params: any) => {

        if (!params.value)
          return '';

        return new Date(params.value)
          .toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          });

      }
    },

    {
      field: 'gender',
      headerName: 'Gender',
      sortable: true,
      flex: 1
    },

    {
      field: 'bloodGroup',
      headerName: 'Blood Group',
      sortable: true,
      flex: 1,
      cellRenderer: (params: any) => {

        if (!params.value)
          return '<span class="text-muted">-</span>';

        return `<span class="badge bg-danger">${params.value}</span>`;

      }
    },

    {
      headerName: 'Actions',
      sortable: false,
      filter: false,
      flex: 1.4,

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

  override loadData(): void {

    this.patientService
      .getAllPatients(
        this.createRequest()
      )
      .subscribe({

        next: (res: any) => {

          if (!res.isSuccess) {

            this.rowData.set([]);

            this.totalRecords.set(0);

            return;

          }

          this.rowData.set(res.data ?? []);

          this.totalRecords.set(res.totalCount ?? 0);

        },

        error: () => {

          this.rowData.set([]);

          this.totalRecords.set(0);

        }

      });

  }

  onCellClicked(event: any): void {

    if (!event.event.target)
      return;

    const target = event.event.target.closest('button');

    if (!target)
      return;

    const data = event.data;

    if (!data)
      return;

    if (target.classList.contains('action-view')) {

      this.router.navigate([
        '/patientdetails',
        data.id
      ]);

      return;

    }

    if (target.classList.contains('action-edit')) {

      this.router.navigate([
        '/patients/edit',
        data.id
      ]);

      return;

    }

    if (target.classList.contains('action-book')) {

      this.getPatientById(data.id);

      this.getDoctors();

      this.openModal();

    }

  }

  getPatientById(id: string): void {

    this.patientService
      .getPatientById(id)
      .subscribe((res: any) => {

        this.patientDetails.set(res.data);

      });

  }

  getDoctors(): void {

    this.patientService
      .doctorLookup()
      .subscribe((res: any) => {

        this.doctors.set(res.data ?? []);

      });

  }

  openModal(): void {

    this.showModal.set(true);

  }

  closeModal(): void {

    this.showModal.set(false);

  }

  handleBooking(data: any): void {

    this.appointmentService
      .createAppointment(data)
      .subscribe({

        next: (res: any) => {

          if (!res.isSuccess) {

            this.toastr.error(
              res.message || 'Something went wrong',
              'Error'
            );

            return;

          }

          this.toastr.success(
            res.message || 'Appointment booked successfully',
            'Success'
          );

          this.closeModal();

        }

      });

  }

}
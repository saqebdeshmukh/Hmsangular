import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AgGridAngular } from 'ag-grid-angular';
import { ColDef } from 'ag-grid-community';

import { BaseGridComponent } from '../../../../GridRequestResponse/BaseGridComponent';
import { ActivatedRoute } from '@angular/router';
import { MedicalRecordService } from '../../../../services/medicarecord.service';
import { AuthService } from '../../../../services/auth.services';
import { ToastService } from '../../../../services/toast.service';
import { AppointmentService } from '../../../../services/appointment.service';
import { AppointmentModalComponent } from '../../patient/appointment-modal.component/appointment-modal.component';
import { PatientService } from '../../../../services/patient.service';

@Component({
  selector: 'app-health-report-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AgGridAngular,
    AppointmentModalComponent
  ],
  templateUrl: './health-report.component.html'
})
export class HealthReportComponent extends BaseGridComponent {

  private service = inject(MedicalRecordService);
  private route = inject(ActivatedRoute);
  private patientService = inject(PatientService);
  patientDetails = signal<any>(null);
  doctors = signal<any[]>([]);
  auth = inject(AuthService);
  private appointmentService = inject(AppointmentService);
  private toastr = inject(ToastService);
  showModal = signal(false);
  reports = signal<any[]>([]);

  patientId = '';

  dateFilter = '';

  constructor() {
    super();

    this.patientId =
      this.route.snapshot.paramMap.get('patientId') ?? '';
  }

  columnDefs: ColDef[] = [

    {
      field: 'createdAt',
      headerName: 'Date',
      sortable: true,
      flex: 1,
      valueFormatter: params => {

        if (!params.value)
          return '';

        const d = new Date(params.value);

        return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
      }
    },

    {
      field: 'weight',
      headerName: 'Weight',
      sortable: true,
      flex: 1
    },

    {
      field: 'height',
      headerName: 'Height',
      sortable: true,
      flex: 1
    },

    {
      field: 'bp',
      headerName: 'Blood Pressure',
      sortable: true,
      flex: 1
    },

    {
      field: 'sugarBeforeMeal',
      headerName: 'Sugar Before Meal',
      sortable: true,
      flex: 1
    },

    {
      field: 'sugarAfterMeal',
      headerName: 'Sugar After Meal',
      sortable: true,
      flex: 1
    }
  ];
  isDoctor(): boolean {

    return this.auth.user()?.role === 'Doctor';

  }
  getPatientById(): void {

    this.patientService
      .getPatientById(this.patientId)
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
  override loadData(): void {

    const filters: any = {};

    if (this.dateFilter) {
      filters.createdAt = this.dateFilter;
    }

    this.service
      .getHealthReport(
        this.patientId,
        this.createRequest(filters)
      )
      .subscribe({

        next: (res: any) => {

          if (!res.isSuccess) {

            this.reports.set([]);
            this.totalRecords.set(0);

            return;
          }

          this.reports.set(res.data);
          this.totalRecords.set(res.totalCount);
        },

        error: () => {

          this.reports.set([]);
          this.totalRecords.set(0);
        }
      });
  }

  override onSortChanged(event: any): void {

    const sort = event.api
      .getColumnState()
      .find((x: any) => x.sort);

    if (sort) {

      this.sortColumn.set(sort.colId);
      this.sortDirection.set(sort.sort);

    } else {

      this.sortColumn.set('createdAt');
      this.sortDirection.set('desc');
    }

    this.pageNumber.set(1);

    this.loadData();
  }

  onDateFilterChange(value: string): void {

    this.dateFilter = value;

    this.pageNumber.set(1);

    this.loadData();
  }

  clearFilters(): void {

    this.dateFilter = '';

    this.pageNumber.set(1);

    this.loadData();
  }
  openModal(): void {
    this.getPatientById();
    this.getDoctors();
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
          this.loadData();
        }

      });

  }

}
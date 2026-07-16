import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AgGridAngular } from 'ag-grid-angular';
import Swal from 'sweetalert2';

import { AppointmentService } from '../../../../services/appointment.service';
import { ToastService } from '../../../../services/toast.service';
import { AppointmentStatus } from '../../appointmentStatus.enum';
import { BaseGridComponent } from '../../../../GridRequestResponse/BaseGridComponent';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    AgGridAngular
  ],
  templateUrl: './appointments.component.html',
  styleUrl: './appointments.component.css'
})
export class AppointmentsComponent extends BaseGridComponent {

  private service = inject(AppointmentService);
  private destroyRef = inject(DestroyRef);
  private toastr = inject(ToastService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  todayAppointments = signal<any[]>([]);
  completedAppointments = signal<any[]>([]);
  appointments = signal<any[]>([]);
  upcomingAppointments = signal<any[]>([]);

  activeTab = signal('today');

  today = new Date();

  rowData = signal<any[]>([]);

  statusFilter = signal('');

  constructor() {
    super();
  }

  columnDefs = [

    {
      field: 'appointmentDate',
      headerName: 'Date',
      flex: 1,
      sortable: true,

      valueFormatter: (params: any) => {

        if (!params.value)
          return '';

        const date = new Date(params.value);

        return date.toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        });

      }

    },

    {
      field: 'patientName',
      headerName: 'Patient Name',
      flex: 1,
      sortable: true
    },

    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      sortable: true,

      cellRenderer: (params: any) => {

        const cssClass = this.getStatusClass(params.value);

        return params.value
          ? `<span class="badge ${cssClass}">${params.value}</span>`
          : `<span class="text-muted">—</span>`;

      }

    },

    {

      headerName: 'Actions',

      flex: 1.2,

      sortable: false,

      cellRenderer: (params: any) => {

        const isScheduled =
          params.data &&
          params.data.status === 'Scheduled';

        return `

          <button
            class="btn btn-sm btn-info me-1 action-view"
            title="View Appointment">

            <i class="fa fa-eye"></i>

          </button>

          ${isScheduled ? `

            <button
              class="btn btn-sm btn-danger action-cancel"
              title="Cancel Appointment">

              <i class="fa fa-times"></i>

            </button>

          ` : ''}

        `;

      }

    }

  ];

  override loadData(): void {

    const filters: any = {};

    if (this.statusFilter()) {

      filters.status = this.statusFilter();

    }

    this.service
      .getAppointments(
        this.createRequest(filters)
      )
      .subscribe({

        next: (res: any) => {

          if (!res?.isSuccess) {

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

          this.toastr.error(
            'Unable to load appointments.',
            'Error'
          );

        }

      });

  }
    loadAppointments(status: string | null = null): void {

    const selectedStatus = status ?? this.statusFilter();

    const normalizedStatus = this.normalizeStatusFilter(selectedStatus);

    this.statusFilter.set(normalizedStatus);

    this.pageNumber.set(1);

    this.loadData();

  }

  onFilterChange(value: string): void {

    this.loadAppointments(value);

  }

  onCellClicked(event: any): void {

    if (!event.event.target) {
      return;
    }

    const target = event.event.target.closest('button');

    if (!target) {
      return;
    }

    const data = event.data;

    if (!data) {
      return;
    }

    if (target.classList.contains('action-view')) {

      this.router.navigate([
        '/appointmentDetails',
        data.id
      ]);

      return;
    }

    if (target.classList.contains('action-cancel')) {

      this.cancelAppointmentWithAlert(data.id);

    }

  }

  override onSortChanged(event: any): void {

    const sort = event.api
      .getColumnState()
      .find((x: any) => x.sort);

    if (sort) {

      this.sortColumn.set(sort.colId);

      this.sortDirection.set(sort.sort);

    }
    else {

      this.sortColumn.set('appointmentDate');

      this.sortDirection.set('desc');

    }

    this.pageNumber.set(1);

    this.loadData();

  }

  private normalizeStatusFilter(value: string): string {

    if (!value) {
      return '';
    }

    return value === 'Cancelled'
      ? 'Canceled'
      : value;

  }

  getStatusClass(status: string): string {

    switch (status) {

      case 'Scheduled':
        return 'bg-warning text-dark';

      case 'Completed':
        return 'bg-success';

      case 'Cancelled':
      case 'Canceled':
        return 'bg-danger';

      default:
        return 'bg-secondary';

    }

  }

  cancelAppointmentWithAlert(id: string): void {

    Swal.fire({

      title: 'Are you sure?',

      text: 'Are you sure you want to cancel this appointment?',

      icon: 'warning',

      showCancelButton: true,

      confirmButtonColor: '#3085d6',

      cancelButtonColor: '#d33',

      confirmButtonText: 'Yes, cancel it!',

      cancelButtonText: 'No',

      allowOutsideClick: false,

      backdrop: true

    }).then(result => {

      if (result.isConfirmed) {

        this.CancelAppointment(id);

      }

    });

  }

  CancelAppointment(id: string): void {

    this.service
      .updateAppointmentStatus(
        id,
        AppointmentStatus.Canceled
      )
      .subscribe({

        next: (res: any) => {

          if (!res?.isSuccess) {

            this.toastr.error(
              res.message ?? 'Unable to cancel appointment',
              'Error'
            );

            return;

          }

          Swal.fire(
            'Cancelled!',
            'Appointment has been cancelled.',
            'success'
          );

          this.toastr.success(
            res.message,
            'Success'
          );

          this.loadAppointments();

        },

        error: () => {

          this.toastr.error(
            'Unable to cancel appointment.',
            'Error'
          );

        }

      });

  }
}
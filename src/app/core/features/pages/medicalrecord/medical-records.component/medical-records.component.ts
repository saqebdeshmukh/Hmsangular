import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { AgGridAngular } from 'ag-grid-angular';
import { ColDef } from 'ag-grid-community';

import { AuthService } from '../../../../services/auth.services';
import { MedicalRecordService } from '../../../../services/medicarecord.service';
import { BaseGridComponent } from '../../../../GridRequestResponse/BaseGridComponent';

@Component({
  selector: 'app-medical-record-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AgGridAngular,
    RouterModule
  ],
  templateUrl: './medical-records.component.html'
})
export class MedicalRecordsComponent extends BaseGridComponent {

  private service = inject(MedicalRecordService);
  private router = inject(Router);

  auth = inject(AuthService);

  records = signal<any[]>([]);

  dateFilter = '';

  constructor() {
    super();
  }

  columnDefs: ColDef[] = [

    {
      field: 'visitDate',
      headerName: 'Visit Date',
      sortable: true,
      flex: 1,
      valueFormatter: params => {

        if (!params.value) return '';

        const d = new Date(params.value);

        return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();

      }
    },

    {
      field: 'patientName',
      colId: 'patientName',
      headerName: 'Patient',
      sortable: true,
      flex: 1
    },

    ...(this.isAdmin()
      ? [
          {
            field: 'doctorName',
            colId: 'doctorName',
            headerName: 'Doctor',
            sortable: true,
            flex: 1,
            valueFormatter: (params: any) =>
              params.value ? `Dr. ${params.value}` : ''
          }
        ]
      : []),

    {
      field: 'diagnosis',
      headerName: 'Diagnosis',
      sortable: true,
      flex: 1,
      valueFormatter: params => {

        if (!params.value)
          return 'N/A';

        return params.value.length > 40
          ? params.value.substring(0, 40) + '...'
          : params.value;

      }
    },

    {
      field: 'treatment',
      headerName: 'Treatment',
      sortable: true,
      flex: 1,
      valueFormatter: params => {

        if (!params.value)
          return 'N/A';

        return params.value.length > 40
          ? params.value.substring(0, 40) + '...'
          : params.value;

      }
    },

    {
      headerName: 'Actions',
      sortable: false,
      filter: false,
      flex: 1.3,

      cellRenderer: (params: any) => {
        const div = document.createElement('div');
        div.className = 'd-flex justify-content-start gap-1 h-100 align-items-center';

        div.innerHTML = `
          <button title="View Details" class="btn btn-sm btn-ghost text-primary action-view">
            <i class="fas fa-eye"></i>
          </button>
          ${this.isDoctor()
            ? `
              <button title="Edit Record" class="btn btn-sm btn-ghost text-warning action-edit">
                <i class="fas fa-edit"></i>
              </button>
              <button title="Create Prescription" class="btn btn-sm btn-ghost text-success action-rx">
                <i class="fas fa-prescription"></i>
              </button>
            `
            : ''}
        `;

        const buttons = div.querySelectorAll('button');

        buttons[0].addEventListener('click', () => {
          this.router.navigate([
            '/medical-records/details',
            params.data.id
          ]);
        });

        if (this.isDoctor()) {
          buttons[1].addEventListener('click', () => {
            this.router.navigate([
              '/medical-records/edit',
              params.data.id
            ]);
          });

          buttons[2].addEventListener('click', () => {
            this.router.navigate([
              '/prescription/create',
              params.data.id
            ]);
          });
        }

        return div;
      }
    }

  ];

  override loadData(): void {

    const filters: any = {};

    if (this.dateFilter) {

      filters.visitDate = this.dateFilter;

    }

    this.service
      .getMedicalRecords(
        this.createRequest(filters)
      )
      .subscribe({

        next: (res: any) => {

          if (!res.isSuccess) {

            this.records.set([]);

            this.totalRecords.set(0);

            return;

          }

          this.records.set(res.data ?? []);

          this.totalRecords.set(res.totalCount ?? 0);

        },

        error: () => {

          this.records.set([]);

          this.totalRecords.set(0);

        }

      });

  }

  isDoctor(): boolean {

    return this.auth.user()?.role === 'Doctor';

  }

  isAdmin(): boolean {

    return this.auth.user()?.role === 'Admin';

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

      this.sortColumn.set('visitDate');

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

    this.search.set('');

    this.pageNumber.set(1);

    this.loadData();

  }

}
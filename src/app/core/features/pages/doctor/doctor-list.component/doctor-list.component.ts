import {
  Component,
  HostListener,
  inject,
  signal
} from '@angular/core';

import {
  AgGridAngular
} from 'ag-grid-angular';

import {
  GridApi,
  GridReadyEvent
} from 'ag-grid-community';

import {
  DoctorService
} from '../../../../services/doctor.service';

import {
  Router,
  RouterModule
} from '@angular/router';


@Component({
  selector: 'app-doctor-list.component',
  imports: [
    AgGridAngular,
    RouterModule
  ],
  templateUrl: './doctor-list.component.html',
  styleUrl: './doctor-list.component.css',
})
export class DoctorListComponent {

  private router = inject(Router);
  private doctorService = inject(DoctorService);

  private gridApi!: GridApi;

  rowData = signal<any[]>([]);


  defaultColDef = {
    sortable: true,
    resizable: true,
    flex: 1,
    minWidth: 100
  };


  columnDefs = [
    {
      field: 'firstName',
      headerName: 'First Name',
      flex: 1
    },

    {
      field: 'lastName',
      headerName: 'Last Name',
      flex: 1
    },

    {
      field: 'email',
      headerName: 'Email',
      flex: 1.5
    },

    {
      field: 'phoneNumber',
      headerName: 'Phone',
      flex: 1
    },

    {
      field: 'specialization',
      headerName: 'Specialization',
      flex: 1.3
    },

    {
      headerName: 'Actions',
      width: 120,
      minWidth: 120,
      maxWidth: 130,
      sortable: false,
      filter: false,
      resizable: false,

      cellRenderer: (params: any) => {
        const div = document.createElement('div');
        div.className = 'd-flex justify-content-start gap-1 h-100 align-items-center';
        div.innerHTML = `
          <button title="Edit Doctor" class="btn btn-sm btn-ghost text-warning action-edit">
            <i class="fas fa-edit"></i>
          </button>
          <button title="Delete Doctor" class="btn btn-sm btn-ghost text-danger action-delete">
            <i class="fas fa-trash-alt"></i>
          </button>
        `;

        const buttons = div.querySelectorAll('button');

        // Edit
        buttons[0].addEventListener('click', () => {
          this.router.navigate([
            '/doctor/edit',
            params.data.id
          ]);
        });

        // Delete
        buttons[1].addEventListener('click', () => {
          // Delete logic
        });

        return div;
      }
    }
  ];


  ngOnInit(): void {

    this.getDoctors();

  }


  getDoctors(): void {

    this.doctorService.getAllDoctors().subscribe({

      next: (res: any) => {

        this.rowData.set(res.data);

      },

      error: (error) => {

        console.error('Error loading doctors:', error);

      }

    });

  }


  onGridReady(params: GridReadyEvent): void {

    this.gridApi = params.api;

    setTimeout(() => {

      this.gridApi.sizeColumnsToFit();

    });

  }


  @HostListener('window:resize')
  onWindowResize(): void {

    if (this.gridApi) {

      setTimeout(() => {

        this.gridApi.sizeColumnsToFit();

      });

    }

  }

}
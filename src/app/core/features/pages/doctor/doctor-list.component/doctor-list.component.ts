import { Component, inject, signal } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { DoctorService } from '../../../../services/doctor.service';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-doctor-list.component',
  imports: [AgGridAngular,RouterModule],
  templateUrl: './doctor-list.component.html',
  styleUrl: './doctor-list.component.css',
})
export class DoctorListComponent {
  columnDefs = [
  { field: 'firstName', headerName: 'First Name', flex: 1 },
  { field: 'lastName', headerName: 'Last Name', flex: 1 },
  { field: 'email', headerName: 'Email', flex: 1 },
  { field: 'phoneNumber', headerName: 'Phone', flex: 1 },
  { field: 'specialization', headerName: 'Specialization', flex: 1 },
  
  {
    headerName: 'Actions',
    cellRenderer: () => `
      <button class="btn btn-sm btn-primary me-1">Edit</button>
      <button class="btn btn-sm btn-danger">Delete</button>
    `
  }
];
rowData = signal<any[]>([]);

private doctorService = inject(DoctorService);

ngOnInit() {
  this.getDoctors();
}

getDoctors() {
  this.doctorService.getAllDoctors().subscribe({
    next: (res: any) => {
      this.rowData.set(res.data);
    }
  });
}
}

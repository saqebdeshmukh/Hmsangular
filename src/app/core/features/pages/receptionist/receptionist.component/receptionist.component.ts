import { Component, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AgGridAngular } from 'ag-grid-angular';
import { ReceptionistService } from '../../../../services/receptionist.service';

@Component({
  selector: 'app-receptionist.component',
  imports: [RouterModule,AgGridAngular],
  templateUrl: './receptionist.component.html',
  styleUrl: './receptionist.component.css',
})
export class ReceptionistComponent {
  private receptionistService = inject(ReceptionistService);
columnDefs = [
  { field: 'name', headerName: 'Name', flex: 1 },
  { field: 'emailId', headerName: 'Email', flex: 1 },
  { field: 'phoneNo', headerName: 'Phone', flex: 1 },
  
  // {
  //   headerName: 'Actions',
  //   cellRenderer: () => `
  //     <button class="btn btn-sm btn-primary me-1">Edit</button>
  //   `
  // }
];
rowData = signal<any[]>([]);
ngOnInit() {
  this.getReceptionists();
}

getReceptionists() {
  this.receptionistService.getAllReceptionists().subscribe({
    next: (res: any) => {
      this.rowData.set(res.data);
      console.log(this.rowData());
    }
  });
}


}

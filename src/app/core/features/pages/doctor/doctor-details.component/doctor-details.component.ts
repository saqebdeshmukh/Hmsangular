import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DoctorService } from '../../../../services/doctor.service';
import { CommonModule } from '@angular/common';
import { AgGridAngular } from 'ag-grid-angular';



@Component({
  selector: 'app-doctor-details.component',
  imports:[CommonModule,AgGridAngular],
 standalone: true,
  templateUrl: './doctor-details.component.html',
  styleUrl: './doctor-details.component.css',
})
export class DoctorDetailsComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
private service = inject(DoctorService);

columnDefs = [
  { field: 'patientName', headerName: 'Patient Name', flex: 1 },
  { field: 'status', headerName: 'Status', flex: 1 },
  { field: 'appointmentDate', headerName: 'Appointment Date', flex: 1 },
];
rowDataForToday = signal<any[]>([]);
rowDataForCompleted = signal<any[]>([]);
  doctor = signal<any>(null);
  role = signal<string | null>(localStorage.getItem('role'));

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.getDoctor(id);
      this.getDoctorAppointments(id);
    }
  }

 getDoctor(id: string) {
  this.service.getDoctorById(id).subscribe({
    next: (res: any) => {
      this.doctor.set(res.data);
    }
  });
}
getDoctorAppointments(id: string) {
  this.service.getDoctorAppointmentsById(id).subscribe({
    next: (res: any) => {
      this.rowDataForCompleted.set(res.data.completedAppointments);
      this.rowDataForToday.set(res.data.todayAppointments);
    }
  });
}

 

  bookAppointment() {
    this.router.navigate(['/appointment/create', this.doctor().id]);
  }
}

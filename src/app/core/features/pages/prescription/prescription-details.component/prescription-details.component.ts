import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { PrescriptionService } from '../../../../services/prescription.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-prescription-details.component',
  imports: [CommonModule],
  templateUrl: './prescription-details.component.html',
  styleUrl: './prescription-details.component.css',
})
export class PrescriptionDetailsComponent {
  private router = inject(Router);
  private prescriptionService = inject(PrescriptionService);
  prescription = signal<any>(null);
role = localStorage.getItem('role');

  ngOnInit() {
    const id = this.router.url.split('/').pop();

    if (!id) {
      this.router.navigate(['/prescriptions']);
      return;
    }

    this.getPrescriptionDetails(id);
  }
  goToIndex() {
  this.router.navigate(['/prescriptions']);
}

goToMyPrescriptions() {
  this.router.navigate(['/my-prescriptions']);
}
prescriptionGiven() {
 this.prescriptionService.updateInternalPrescriptionStatus(this.prescription().id).subscribe({
  next : (res: any) => {
    if (res.isSuccess) {
      this.router.navigate(['/receptionistdashboard']);
    }
  },
  error: (err) => {
    console.error('Error updating prescription status:', err.message);
  }
 });
}
edit(id: string) {
  this.router.navigate(['/prescription/edit', id]);
}

print(id: string) {
  window.open(`/prescriptionprint/${id}`, '_blank');
}

viewMedicalRecord(id: string) {
  this.router.navigate(['/medical-records/details', id]);
}

viewPatient(id: string) {
  this.router.navigate(['/patientdetails', id]);
}

getPrescriptionDetails(id: string) {
  this.prescriptionService.getPrescriptionById(id).subscribe((res: any) => {
    console.log('Prescription details:', res.data);
    this.prescription.set(res.data);
  });
}
}

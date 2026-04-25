import { Component, inject, OnInit, signal } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { PrescriptionFormComponent } from "./prescription-form.component";
import { PrescriptionService } from "../../../../services/prescription.service";
import { MedicalRecordService } from "../../../../services/medicarecord.service";
import { ToastService } from "../../../../services/toast.service";
import { CommonModule } from "@angular/common";

@Component({
  standalone: true,
  imports: [PrescriptionFormComponent, CommonModule],
  template: `

  @if (record()) {

    <app-prescription-form
      [record]="record()"
      (formSubmit)="create($event)">
    </app-prescription-form>
    

  } @else {

    <div class="text-center mt-5">
      <div class="spinner-border text-info"></div>
      <p class="mt-2 text-muted">Loading medical record...</p>
    </div>

  }

  `
})
export class CreatePrescriptionComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(PrescriptionService);
  private recordService = inject(MedicalRecordService);
  private toastr = inject(ToastService);

  // ✅ Angular signal
  record = signal<any>(null);
constructor() {
  console.log('Component loaded');
}
  ngOnInit() {
    console.log('ngOnInit triggered');
    this.route.paramMap.subscribe(params => {
    const recordId = params.get('recordId');
console.log('Received recordId:', recordId);
    
    if (!recordId) {
      this.toastr.error('Invalid record');
      this.router.navigate(['/medical-records']);
      return;
    }
  
    this.loadMedicalRecord(recordId);
  });
  }
loadMedicalRecord(recordId: string) {
  this.recordService.getMedicalRecordById(recordId).subscribe({
    next: (res: any) => {
      if (res.isSuccess && res.data) {
        const record = Array.isArray(res.data) ? res.data[0] : res.data;
        this.record.set(record);
        console.log('Loaded medical record:', record);
      } else {
        this.toastr.error('Record not found');
        this.router.navigate(['/medical-records']);
      }
    },
    error: () => {
      this.toastr.error('Failed to load record');
      this.router.navigate(['/medical-records']);
    }
  });
}
  create(data: any) {

    const payload = {
    ...data,
    medicalRecordId: this.record()?.id,
    prescriptionItemRequests: data.items   // ✅ FIX
  };

  delete payload.items; // optional but clean

  console.log('Final payload:', payload);

    this.service.createPrescription(payload).subscribe({
      next: (res: any) => {
        this.toastr.success(res.message || 'Prescription created successfully');
        this.router.navigate(['/prescriptions']);
      },
      error: () => {
        this.toastr.error('Failed to create prescription');
      }
    });
  }
}
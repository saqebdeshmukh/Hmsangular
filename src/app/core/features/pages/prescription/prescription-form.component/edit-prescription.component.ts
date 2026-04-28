import { Component, DestroyRef, inject, Signal, signal } from "@angular/core";
import { PrescriptionFormComponent } from "./prescription-form.component";
import { PrescriptionService } from "../../../../services/prescription.service";
import { ToastService } from "../../../../services/toast.service";
import { ActivatedRoute, Router } from "@angular/router";
import { MedicalRecordService } from "../../../../services/medicarecord.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Component({
  selector: 'app-edit-prescription',
  standalone: true,
  imports: [PrescriptionFormComponent],
  template: `
  @if (prescription()) {
    <app-prescription-form
      [initialData]="prescription()"
      [record]="prescription()?.medicalRecord"
      [isEdit]="true"
      (formSubmit)="update($event)">
    </app-prescription-form>
  }
  `
})
export class EditPrescriptionComponent {
  private route = inject(ActivatedRoute);
  private toastr = inject(ToastService);
  private router = inject(Router);
  mrecord = signal<any>(null);
  prescription = signal<any>(null);
  private service = inject(PrescriptionService);
  private destroyRef = inject(DestroyRef);

  ngOnInit() {
    const id = (this.route.snapshot.paramMap.get('id'));

    if (!id) {
      this.router.navigate(['/prescriptions']);
      return;
    }

    this.service.getPrescriptionById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res: any) => {
        this.prescription.set(res.data);
      });


  }

  update(data: any) {
     const payload = {
    ...data,
    prescriptionItemRequests: data.items.map((item: any) => ({
      ...item,
      duration: item.duration?.toString() // optional safety
    }))
  };

  delete payload.items;

  console.log('Final payload:', payload);
    this.service.updatePrescription(data.id, payload).subscribe({
      next: (res: any) => {
        this.toastr.success(res.message || 'Prescription updated successfully');
        this.router.navigate(['/prescriptions']);
      }
    });
  }
  //   loadMedicalRecord(recordId: string) {
  //   this.recordService.getMedicalRecordById(recordId).subscribe({
  //     next: (res: any) => {
  //       if (res.isSuccess && res.data) {
  //         const record = Array.isArray(res.data) ? res.data[0] : res.data;
  //         this.mrecord.set(record);
  //         console.log('Loaded medical record:', record);
  //       } else {
  //         this.toastr.error('Record not found');
  //         this.router.navigate(['/medical-records']);
  //       }
  //     },
  //     error: () => {
  //       this.toastr.error('Failed to load record');
  //       this.router.navigate(['/medical-records']);
  //     }
  //   });
  // }
}
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MedicalRecordFormComponent } from './medical-record-form.component';
import { MedicalRecordService } from '../../../../services/medicarecord.service';
import { ToastService } from '../../../../services/toast.service';

@Component({
  selector: 'app-edit-medical-record',
  standalone: true,
  imports: [MedicalRecordFormComponent],
  template: `
    @if (record()) {
  <app-medical-record-form
    [initialData]="record()"
    [isEdit]="true"
    (formSubmit)="update($event)">
  </app-medical-record-form>
}
  `
})
export class EditMedicalRecordComponent {

  private route = inject(ActivatedRoute);
  private service = inject(MedicalRecordService);
  private toast = inject(ToastService);
  private router = inject(Router);

  record = signal<any>(null);

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
console.log('Editing medical record with id:', id);
    this.service.getMedicalRecordForEdit(id).subscribe(res => {
      this.record.set(res.data);
    });
  }

  update(data: any) {
    this.service.updateMedicalRecord(data.id, data).subscribe(res => {
      if (res.isSuccess) {
        this.toast.success(res.message);
        this.router.navigate(['/medical-records']);
      }
    });
  }
}
import { Component, inject, signal } from "@angular/core";
import { DoctorFormComponent } from "./doctor-form-component";
import { DoctorService } from "../../../../services/doctor.service";
import { ToastService } from "../../../../services/toast.service";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
    selector: 'app-edit-doctor',
  standalone: true,
  imports: [DoctorFormComponent],
  template: `
    @if (!doctor()) {
      <p>Loading...</p>
    } @else {
      <app-doctor-form-component
        [initialData]="doctor()"
        [isEdit]="true"
        (formSubmit)="update($event)">
      </app-doctor-form-component>
    }
  `
})
export class EditDoctorComponent {

  doctor = signal<any>(null);

  private service = inject(DoctorService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastService);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    this.service.getDoctorById(id).subscribe(res => {
      this.doctor.set(res.data);
    });
  }

  update(data: any) {
    this.service.updateDoctor(data.id, data).subscribe(() => {
      this.toast.success('Doctor updated');
      this.router.navigate(['/doctors']);
    });
  }
}
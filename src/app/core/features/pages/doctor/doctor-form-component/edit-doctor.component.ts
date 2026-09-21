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
      console.log('Fetched doctor for edit:', res.data);
    });
  }

  update(data: any) {
    const doctorid = this.route.snapshot.paramMap.get('id');
    this.service.updateDoctor(data, doctorid).subscribe({
      next: (res) => {
        this.toast.success('Success',res.message);
        this.router.navigate(['/doctors']);
      }
    });
  }
}
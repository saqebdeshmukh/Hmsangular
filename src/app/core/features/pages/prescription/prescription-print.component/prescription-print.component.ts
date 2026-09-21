import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PrescriptionService } from '../../../../services/prescription.service';
import { AppointmentService } from '../../../../services/appointment.service';
import { ToastrService } from 'ngx-toastr';
import { AppointmentStatus } from '../../appointmentStatus.enum';

@Component({
  selector: 'app-prescription-print',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './prescription-print.component.html',
  styleUrl: './prescription-print.component.css'
})
export class PrescriptionPrintComponent {

  private route = inject(ActivatedRoute);
  private service = inject(PrescriptionService);
  private appointmentService = inject(AppointmentService);
  private toastr = inject(ToastrService);

  prescription = signal<any>(null);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.service.getPrescriptionByIdForPrint(id).subscribe((res: any) => {
      this.prescription.set(res.data);
      console.log(res.data);
    });
  }
  
  print() {
    window.print();
  }
  
  complete() {
    this.appointmentService.updateAppointmentStatus(this.prescription().appointmentId, AppointmentStatus.Completed).subscribe((res: any) => {
      this.toastr.success(res.message, 'Success');
    })
  }
}
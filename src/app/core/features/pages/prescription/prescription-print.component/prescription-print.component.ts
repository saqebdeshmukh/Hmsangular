import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PrescriptionService } from '../../../../services/prescription.service';

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

  prescription = signal<any>(null);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.service.getPrescriptionById(id).subscribe((res: any) => {
      this.prescription.set(res.data);
    });
  }
today = new Date();
  print() {
    window.print();
  }
}
import { Component, inject, signal } from '@angular/core';
import { MedicalRecordService } from '../../../../services/medicarecord.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-select-medical-record.component',
  imports: [CommonModule, RouterModule],
  templateUrl: './select-medical-record.component.html',
  styleUrl: './select-medical-record.component.css',
})
export class SelectMedicalRecordComponent {
  private service = inject(MedicalRecordService);
  medicalRecords = signal<any>([]);

  ngOnInit() {
    this.getMedicalRecords();
  }

  getMedicalRecords() {
    this.service.getMedicalRecords().subscribe((res: any) => {
      this.medicalRecords.set(res.data);
      console.log(res.data)
    });
  }
}

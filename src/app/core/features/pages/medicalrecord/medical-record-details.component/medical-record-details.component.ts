import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MedicalRecordService } from '../../../../services/medicarecord.service';

@Component({
  selector: 'app-medical-record-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './medical-record-details.component.html',
  styleUrl: './medical-record-details.component.css'
})
export class MedicalRecordDetailsComponent {

  private service = inject(MedicalRecordService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  successMessage: string | null = null;
  record = signal<any>(null);
  role = 'Doctor'; // 👉 replace with your auth service

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.service.getMedicalRecordById(id).subscribe(res => {
        this.record.set(res.data?.[0]); // ✅ API returns LIST
      });
    }
  }
  NavToPrescription(recordId: string) {
    // ✅ Navigate to prescription form with recordId
    console.log('Navigating to prescription form for recordId:', recordId);
    this.router.navigate(['/prescription/create', recordId]);
  }
}
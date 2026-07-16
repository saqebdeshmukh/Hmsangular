import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MedicalRecordService } from '../../../../services/medicarecord.service';
import { AuthService } from '../../../../services/auth.services';

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
  private auth = inject(AuthService);
  successMessage: string | null = null;
  record = signal<any>(null);
  familyHistory = signal({ parents: '', grandparents: '' });
  role = computed(() => this.auth.user()?.role);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.service.getMedicalRecordById(id).subscribe(res => {
        const record = res.data || null;
        this.record.set(record);
        this.familyHistory.set(this.parseFamilyHistory(record));
      });
    }
  }

  private parseFamilyHistory(record: any) {
    const raw = record?.geneticFrom || record?.GeneticFrom || record?.genetic || '';
    const lines = raw
      .toString()
      .split(/\r?\n/)
      .map((line: string) => line.trim())
      .filter(Boolean);

    const history = {
      parents: '',
      grandparents: ''
    };

    for (const line of lines) {
      const normalized = line.replace(/\s+/g, ' ').trim();
      const value = normalized.replace(/^[^:]+:\s*/i, '');

      if (/grand\s*parents?/i.test(normalized)) {
        history.grandparents = value;
      } else if (/parents?/i.test(normalized)) {
        history.parents = value;
      }
    }

    if (!history.parents && lines.length > 0 && !history.grandparents) {
      history.parents = lines.join(' | ');
    }

    return history;
  }

  NavToPrescription(recordId: string) {
    // ✅ Navigate to prescription form with recordId
    console.log('Navigating to prescription form for recordId:', recordId);
    this.router.navigate(['/prescription/create', recordId]);
  }
}
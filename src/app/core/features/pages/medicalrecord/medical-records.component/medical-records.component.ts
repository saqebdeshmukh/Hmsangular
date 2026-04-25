import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef } from 'ag-grid-community';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../services/auth.services';
import { MedicalRecordService } from '../../../../services/medicarecord.service';

@Component({
  selector: 'app-medical-record-list',
  standalone: true,
  imports: [CommonModule, AgGridAngular, FormsModule, RouterModule],
  templateUrl: './medical-records.component.html',
})
export class MedicalRecordsComponent {
  private service = inject(MedicalRecordService);
  private router = inject(Router);
  auth = inject(AuthService);

  records = signal<any[]>([]);

  searchText = '';
  dateFilter = '';

  columnDefs: ColDef[] = [
    {
      headerName: 'Visit Date',
      field: 'visitDate',
      flex: 1,
      valueGetter: (p: any) => {
        const d = new Date(p.data.visitDate);
        return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
      }
    },
    {
      headerName: 'Patient',
      flex: 1,
      valueGetter: (p: any) =>
        `${p.data.patientName}`
    },

    ...(this.isAdmin() ? [{
      headerName: 'Doctor',
      flex: 1,
      valueGetter: (p: any) =>
        `Dr. ${p.data.doctor?.firstName} ${p.data.doctor?.lastName}`
    }] : []),

    {
      field: 'diagnosis',
      headerName: 'Diagnosis',
      flex: 1,
      valueGetter: (p: any) =>
        p.data.diagnosis?.length > 40
          ? p.data.diagnosis.substring(0, 40) + '...'
          : p.data.diagnosis || 'N/A'
    },
    {
      field: 'treatment',
      headerName: 'Treatment',
      flex: 1,
      valueGetter: (p: any) =>
        p.data.treatment?.length > 40
          ? p.data.treatment.substring(0, 40) + '...'
          : p.data.treatment || 'N/A'
    },
    {
      headerName: 'Actions',
      cellRenderer: (params: any) => {
        const div = document.createElement('div');

        div.innerHTML = `
          <button class="btn btn-sm btn-outline-primary me-1"><i class="bi bi-eye"></i></button>
          ${this.isDoctor() ? `
            <button class="btn btn-sm btn-outline-warning me-1"><i class="bi bi-pencil"></i></button>
            <button class="btn btn-sm btn-outline-success"><i class="bi bi-capsule"></i></button>
          ` : ''}
        `;

        const buttons = div.querySelectorAll('button');

        // VIEW
        buttons[0].addEventListener('click', () =>
          this.router.navigate(['/medical-records/details', params.data.id])
        );

        if (this.isDoctor()) {
          // EDIT
          buttons[1].addEventListener('click', () =>
            this.router.navigate(['/medical-records/edit', params.data.id])
          );

          // PRESCRIPTION
          buttons[2].addEventListener('click', () =>
           this.router.navigate(['/prescription/create', params.data.id])
          );
        }

        return div;
      }
    }
  ];

  ngOnInit() {
    this.loadRecords();
  }

  loadRecords() {
    this.service.getMedicalRecords().subscribe(res => {
      this.records.set(res.data || []);
    });
  }

  isDoctor() {
    return this.auth.user()?.role === 'Doctor';
  }

  isAdmin() {
    return this.auth.user()?.role === 'Admin';
  }

  // 🔥 FILTERING
  get filteredRecords() {
    return this.records().filter(r => {

      const text = JSON.stringify(r).toLowerCase();
      const matchesSearch = text.includes(this.searchText.toLowerCase());

      const matchesDate =
        !this.dateFilter ||
        new Date(r.visitDate).toISOString().slice(0, 10) === this.dateFilter;

      return matchesSearch && matchesDate;
    });
  }

  clearFilters() {
    this.searchText = '';
    this.dateFilter = '';
  }
}

import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, ColGroupDef } from 'ag-grid-community';
import { Router, RouterModule } from '@angular/router';
import { PrescriptionService } from '../../../../services/prescription.service';
import { AuthService } from '../../../../services/auth.services';

@Component({
  selector: 'app-prescription-list.component',
  imports: [CommonModule, AgGridAngular,RouterModule],
  templateUrl: './prescription-list.component.html',
  styleUrl: './prescription-list.component.css',
})
export class PrescriptionListComponent {
  private service = inject(PrescriptionService);
  private auth = inject(AuthService);
  private router = inject(Router);

  // 🔥 Signals
  prescriptions = signal<any[]>([]);
  search = signal('');
  dateFilter = signal('');
  patientFilter = signal('');
  doctorFilter = signal('');

  role = computed(() => this.auth.user()?.role);

  ngOnInit() {
    this.service.getPrescriptions().subscribe(res => {
      this.prescriptions.set(res.data || []);
    });
  }

  // 🔥 Filtering logic (replaces your JS completely)
  filteredData = computed(() => {
  return this.prescriptions().filter(p => {

    const searchMatch =
      !this.search() ||
      `${p.patientName} ${p.medicineName ?? ''}`
        .toLowerCase()
        .includes(this.search().toLowerCase());

    const dateMatch =
      !this.dateFilter() ||
      p.prescriptionDate?.startsWith(this.dateFilter());

    const patientMatch =
      !this.patientFilter() ||
      p.patientId === this.patientFilter();

    const doctorMatch =
      !this.doctorFilter() ||
      p.doctorId === this.doctorFilter();

    // ✅ 🔥 ROLE-BASED FILTER
    const roleMatch =
      this.role() !== 'Receptionist' ||
      p.type === 'Internal';

    return searchMatch && dateMatch && patientMatch && doctorMatch && roleMatch;
  });
});

  // 🔥 AG GRID COLUMN CONFIG
  columnDefs: (ColDef | ColGroupDef)[] = [
    {
      headerName: 'Date',
      field: 'prescriptionDate',
      valueFormatter: (p) =>
        new Date(p.value).toLocaleDateString()
    },
   
    {
      field: 'patientName',
      headerName: 'Patient'
    },
    {
      field: 'doctorName',
      headerName: 'Doctor'
    },
     {
    headerName: 'Prescription Items',
    children: [
      {
        headerName: 'Medicine Name',
        field: 'prescriptionItemRequests',
        flex: 1,
        autoHeight: true,
        cellRenderer: (p: any) => {
          if (!p.data.prescriptionItemRequests?.length) return 'N/A';

          return `
            <div style="display:flex; flex-direction:column; gap:4px;">
              ${p.data.prescriptionItemRequests.map((i: any) => `
                <div>${i.medicineName}</div>
              `).join('')}
            </div>
          `;
        }
      },
      {
        headerName: 'Dosage',
        field: 'prescriptionItemRequests',
        flex: 1,
        autoHeight: true,
        cellRenderer: (p: any) => {
          if (!p.data.prescriptionItemRequests?.length) return '';

          return `
            <div style="display:flex; flex-direction:column; gap:4px;">
              ${p.data.prescriptionItemRequests.map((i: any) => `
                <div>${i.dosage}</div>
              `).join('')}
            </div>
          `;
        }
      },
      {
        headerName: 'Duration',
        field: 'prescriptionItemRequests',
        flex: 1,
        autoHeight: true,
        cellRenderer: (p: any) => {
          if (!p.data.prescriptionItemRequests?.length) return '';

          return `
            <div style="display:flex; flex-direction:column; gap:4px;">
              ${p.data.prescriptionItemRequests.map((i: any) => `
                <div>${i.duration}</div>
              `).join('')}
            </div>
          `;
        }
      }
    ]
  
},
    // 🔥 ACTIONS COLUMN
    {
  headerName: 'Actions',
  cellRenderer: (params: any) => {
    const id = params.data.id;
    const role = this.role();

    return `
      <button class="btn btn-sm btn-primary view-btn">View</button>
      ${role !== 'Receptionist'
        ? `<button class="btn btn-sm btn-secondary print-btn">Print</button>`
        : ''
      }
      ${role === 'Doctor'
        ? `<button class="btn btn-sm btn-warning edit-btn">Edit</button>`
        : ''
      }
    `;
  },
      onCellClicked: (params: any) => {
        const id = params.data.id;

        if (params.event.target.classList.contains('view-btn')) {
          this.router.navigate(['/prescriptiondetails', id]);
        }

        if (params.event.target.classList.contains('edit-btn')) {
          this.router.navigate(['/prescription/edit', id]);
        }

        if (params.event.target.classList.contains('print-btn')) {
          window.open(`/prescriptionprint/${id}`, '_blank');
        }
      }
    }
  ];
}

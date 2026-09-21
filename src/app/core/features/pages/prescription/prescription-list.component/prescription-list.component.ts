import { Component, inject, signal, computed, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, ColGroupDef } from 'ag-grid-community';
import { Router, RouterModule } from '@angular/router';
import { PrescriptionService } from '../../../../services/prescription.service';
import { AuthService } from '../../../../services/auth.services';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BaseGridComponent } from '../../../../GridRequestResponse/BaseGridComponent';


@Component({
  selector: 'app-prescription-list.component',
  imports: [CommonModule, AgGridAngular, RouterModule],
  templateUrl: './prescription-list.component.html',
  styleUrl: './prescription-list.component.css',
})
export class PrescriptionListComponent extends BaseGridComponent {
  private service = inject(PrescriptionService);
  private auth = inject(AuthService);
  private router = inject(Router);
  internalRows = signal<any[]>([]);
  externalRows = signal<any[]>([]);
  private destroyRef = inject(DestroyRef);

  activeTab = signal<TabType>('internal');

  role = computed(() => this.auth.user()?.role);
  constructor() {
    super();
  }
  ngOnInit(): void {

    this.activeTab.set('internal');
    this.loadData();
  }
  //  ngOnInit() {

  //   this.loadData();

  // }
  paginationState = signal<PaginationState>({
    internal: {
      pageNumber: 1,
      pageSize: 10,
      totalRecords: 0,
      search: '',
      sortColumn: 'prescriptionDate',
      sortDirection: 'desc',
      filters: {
        date: '',
        patientId: '',
        doctorId: ''
      }
    },

    external: {
      pageNumber: 1,
      pageSize: 10,
      totalRecords: 0,
      search: '',
      sortColumn: 'prescriptionDate',
      sortDirection: 'desc',
      filters: {
        date: '',
        patientId: '',
        doctorId: ''
      }
    }
  });



  currentState = computed(() => {

    return this.paginationState()[this.activeTab() as 'internal' | 'external'];

  });
  private updateCurrentState(update: (state: TabPagination) => void): void {
    this.updateCurrentTab(state => {
      update(state);
      return state;
    });
  }

  private updateCurrentTab(update: (state: TabPagination) => TabPagination): void {
    this.paginationState.update(state => {
      const activeTab = this.activeTab();
      const currentState = state[activeTab];
      const updatedState = update({ ...currentState });

      return {
        ...state,
        [activeTab]: updatedState
      };
    });
  }

  private getTotalPages(): number {

    const current = this.currentState();

    const pages = Math.ceil(current.totalRecords / current.pageSize);

    return pages === 0 ? 1 : pages;

  }

  currentSearchValue = computed(() =>
    this.currentState().search
  );

  currentDateValue = computed(() =>
    this.currentState().filters.date
  );

  currentPatientValue = computed(() =>
    this.currentState().filters.patientId
  );
  currentPageNumber = computed(() =>
    this.currentState().pageNumber
  );

  currentPageSize = computed(() =>
    this.currentState().pageSize
  );

  currentTotalRecords = computed(() =>
    this.currentState().totalRecords
  );

  currentTotalPages = computed(() => {

    const total = Math.ceil(
      this.currentState().totalRecords /
      this.currentState().pageSize
    );

    return total === 0 ? 1 : total;

  });

  currentStartRecord = computed(() => {

    if (this.currentState().totalRecords === 0)
      return 0;

    return ((this.currentState().pageNumber - 1)
      * this.currentState().pageSize) + 1;

  });

  currentEndRecord = computed(() => {

    return Math.min(

      this.currentState().pageNumber
      * this.currentState().pageSize,

      this.currentState().totalRecords

    );

  });

  currentPages = computed(() => {

    const total = this.currentTotalPages();

    const current = this.currentPageNumber();

    let start = Math.max(current - 2, 1);

    let end = Math.min(start + 4, total);

    if (end - start < 4)
      start = Math.max(end - 4, 1);

    return Array.from(

      { length: end - start + 1 },

      (_, i) => start + i

    );

  });
  currentDoctorValue = computed(() =>
    this.currentState().filters.doctorId
  );


  // filterStateByTab = signal<Record<string, PrescriptionFilterState>>({
  //   internal: {
  //     search: '',
  //     date: '',
  //     patient: '',
  //     doctor: ''
  //   },
  //   external: {
  //     search: '',
  //     date: '',
  //     patient: '',
  //     doctor: ''
  //   }
  // });

  override loadData(): void {

    const tab = this.activeTab();
    const state = this.paginationState()[tab];

    const request = {
      pageNumber: state.pageNumber,
      pageSize: state.pageSize,
      search: state.search,
      sortColumn: state.sortColumn,
      sortDirection: state.sortDirection,

      filters: {
        date: state.filters.date,
        patientId: state.filters.patientId,
        doctorId: state.filters.doctorId
      }
    };

    const api = tab === 'internal'
      ? this.service.getInternalPrescriptions(request)
      : this.service.getExternalPrescriptions(request);
    console.log('API request for', tab, 'tab:', request, 'API response:', api);
    api
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {

        if (!res.isSuccess) {
          return;
        }

        // Update rows for the tab that made this request
        if (tab === 'internal') {
          this.internalRows.set(res.data || []);
        } else {
          this.externalRows.set(res.data || []);
        }

        // IMPORTANT:
        // Update the same tab that made the API request.
        this.paginationState.update(state => ({
          ...state,
          [tab]: {
            ...state[tab],
            totalRecords: res.totalCount || 0
          }
        }));

      });
  }
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
    // {
    //   field: 'type',
    //   headerName: 'Type'
    // },
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
        const isInternalTab = this.activeTab() === 'internal';

        return `
          <div class="d-flex justify-content-start gap-1 h-100 align-items-center">
            <button title="View Prescription" class="btn btn-sm btn-ghost text-primary view-btn">
              <i class="fas fa-eye"></i>
            </button>
            ${!isInternalTab
            ? `<button title="Print Prescription" class="btn btn-sm btn-ghost text-secondary print-btn">
                  <i class="fas fa-print"></i>
                </button>`
            : ''
          }
            ${role === 'Doctor'
            ? `<button title="Edit Prescription" class="btn btn-sm btn-ghost text-warning edit-btn">
                  <i class="fas fa-edit"></i>
                </button>`
            : ''
          }
          </div>
        `;
      },
      onCellClicked: (params: any) => {
        const id = params.data.id;

        const target = params.event.target as HTMLElement;

        if (target.closest('.view-btn')) {
          this.router.navigate(['/prescriptiondetails', id]);
          return;
        }

        if (target.closest('.edit-btn')) {
          this.router.navigate(['/prescription/edit', id]);
          return;
        }

        if (target.closest('.print-btn')) {
          window.open(`/prescriptionprint/${id}`, '_blank');
          return;
        }
      }
    }
  ];

  override onSearch(value: string) {
    super.onSearch(value);
  }
  onPatientChange(value: string) {

    this.filters.update(f => ({
      ...f,
      patientId: value
    }));

    this.pageNumber.set(1);

    this.loadData();
  }
  onDoctorChange(value: string) {

    this.filters.update(f => ({
      ...f,
      doctorId: value
    }));

    this.pageNumber.set(1);

    this.loadData();
  }
  clearFilters() {

    this.updateCurrentState(current => {

      current.pageNumber = 1;

      current.search = '';

      current.sortColumn = 'prescriptionDate';

      current.sortDirection = 'desc';

      current.filters = {

        date: '',
        patientId: '',
        doctorId: ''

      };

    });

    this.loadData();

  }
  onDateFilterChange(value: string) {

    this.updateCurrentState(current => {

      current.filters.date = value;

      current.pageNumber = 1;

    });

    this.loadData();

  }
  onPatientFilterChange(value: string) {

    this.updateCurrentState(current => {

      current.filters.patientId = value;

      current.pageNumber = 1;

    });

    this.loadData();

  }
  onDoctorFilterChange(value: string) {

    this.updateCurrentState(current => {

      current.filters.doctorId = value;

      current.pageNumber = 1;

    });

    this.loadData();

  }
  onTabChange(tab: TabType) {

    this.activeTab.set(tab);
    console.log('Tab changed to:', tab);
    this.loadData();
  }
  override nextPage(): void {

    this.updateCurrentState(current => {

      const totalPages = this.getTotalPages();

      if (current.pageNumber < totalPages)
        current.pageNumber++;

    });

    this.loadData();
  }

  override previousPage(): void {

    this.updateCurrentState(current => {

      if (current.pageNumber > 1)
        current.pageNumber--;

    });

    this.loadData();

  }

  override firstPage(): void {

    this.updateCurrentState(current => {

      current.pageNumber = 1;

    });

    this.loadData();

  }

  override lastPage(): void {

    this.updateCurrentState(current => {

      current.pageNumber = this.getTotalPages();

    });

    this.loadData();

  }
  override goToPage(page: number): void {

    this.updateCurrentState(current => {

      current.pageNumber = page;

    });

    this.loadData();

  }


  updateSearchFilter(value: string) {

    this.paginationState.update(state => {

      state[this.activeTab()].search = value;

      state[this.activeTab()].pageNumber = 1;

      return { ...state };

    });

    this.loadData();

  }
  updateDateFilter(value: string): void {
    this.updateFilter('date', value);
  }

  updatePatientFilter(value: string): void {
    this.updateFilter('patientId', value);
  }

  updateDoctorFilter(value: string): void {
    this.updateFilter('doctorId', value);
  }
  private updateFilter(
    key: 'date' | 'patientId' | 'doctorId',
    value: string
  ): void {
    this.updateCurrentTab(state => ({
      ...state,
      pageNumber: 1,
      filters: {
        ...state.filters,
        [key]: value
      }
    }));

    this.loadData();
  }
  override onSortChanged(event: any) {

    const sort = event.api
      .getColumnState()
      .find((x: any) => x.sort);

    this.paginationState.update(state => {

      if (sort) {

        state[this.activeTab()].sortColumn = sort.colId;

        state[this.activeTab()].sortDirection = sort.sort;

      }
      else {

        state[this.activeTab()].sortColumn = "prescriptionDate";

        state[this.activeTab()].sortDirection = "desc";

      }

      state[this.activeTab()].pageNumber = 1;

      return { ...state };

    });

    this.loadData();

  }
  override onPageSizeChange(value: string) {

    const size = Number(value);

    if (size <= 0)
      return;

    this.updateCurrentState(current => {

      current.pageSize = size;

      current.pageNumber = 1;

    });

    this.loadData();

  }

}

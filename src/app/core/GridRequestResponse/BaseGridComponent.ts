import { GridApi } from 'ag-grid-community';
import { computed, signal } from '@angular/core';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

export abstract class BaseGridComponent {

  protected gridApi!: GridApi;

  private searchSubject = new Subject<string>();

  // Pagination
  pageNumber = signal(1);
  pageSize = signal(10);
  totalRecords = signal(0);

  // Search & Sorting
  search = signal('');
  sortColumn = signal('createdAt');
  sortDirection = signal<'asc' | 'desc'>('desc');

  // Filters
  filters = signal<{ [key: string]: any }>({});

  // Page size dropdown
  pageSizeOptions = [10, 20, 50, 100];

  constructor() {
    this.initializeSearch();
  }

  protected abstract loadData(): void;

  //#region Grid

  onGridReady(event: any): void {
    this.gridApi = event.api;
    this.loadData();
  }

  //#endregion

  //#region Search

  onSearch(value: string): void {
    this.searchSubject.next(value);
  }

  private initializeSearch(): void {

    this.searchSubject
      .pipe(
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe(value => {

        this.search.set(value.trim());

        this.pageNumber.set(1);

        this.loadData();

      });

  }

  //#endregion

  //#region Sorting

  onSortChanged(event: any): void {

    const sort = event.api
      .getColumnState()
      .find((x: any) => x.sort);

    if (sort) {

      this.sortColumn.set(sort.colId);

      this.sortDirection.set(sort.sort);

    }
    else {

      this.sortColumn.set('createdAt');

      this.sortDirection.set('desc');

    }

    this.pageNumber.set(1);

    this.loadData();

  }

  //#endregion

  //#region Pagination

  totalPages = computed(() => {

    const total = Math.ceil(
      this.totalRecords() / this.pageSize()
    );

    return total === 0 ? 1 : total;

  });

  pages = computed(() => {

    const total = this.totalPages();

    const current = this.pageNumber();

    let start = Math.max(current - 2, 1);

    let end = Math.min(start + 4, total);

    if (end - start < 4) {

      start = Math.max(end - 4, 1);

    }

    return Array.from(
      { length: end - start + 1 },
      (_, i) => start + i
    );

  });

  firstPage(): void {

    if (this.pageNumber() === 1)
      return;

    this.pageNumber.set(1);

    this.loadData();

  }

  previousPage(): void {

    if (this.pageNumber() === 1)
      return;

    this.pageNumber.update(x => x - 1);

    this.loadData();

  }

  nextPage(): void {

    if (this.pageNumber() >= this.totalPages())
      return;

    this.pageNumber.update(x => x + 1);

    this.loadData();

  }

  lastPage(): void {

    if (this.pageNumber() === this.totalPages())
      return;

    this.pageNumber.set(this.totalPages());

    this.loadData();

  }

  goToPage(page: number): void {

    if (page < 1 || page > this.totalPages())
      return;

    this.pageNumber.set(page);

    this.loadData();

  }

  onPageSizeChange(value: string | number): void {

    const size = Number(value);

    if (!Number.isFinite(size) || size <= 0)
      return;

    this.pageSize.set(size);

    this.pageNumber.set(1);

    this.loadData();

  }

  //#endregion

  //#region Display

  startRecord = computed(() => {

    if (this.totalRecords() === 0)
      return 0;

    return ((this.pageNumber() - 1) * this.pageSize()) + 1;

  });

  endRecord = computed(() => {

    return Math.min(

      this.pageNumber() * this.pageSize(),

      this.totalRecords()

    );

  });

  //#endregion

  //#region Request Helper

  protected createRequest(
    filters: { [key: string]: any } = {}
  ) {

    return {
      pageNumber: this.pageNumber(),
      pageSize: this.pageSize(),
      search: this.search(),
      sortColumn: this.sortColumn(),
      sortDirection: this.sortDirection(),
      filters
    };

  }

  //#endregion

}
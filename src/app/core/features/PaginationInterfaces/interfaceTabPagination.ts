type TabType = 'internal' | 'external';

interface TabPagination {
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  search: string;
  sortColumn: string;
  sortDirection: 'asc' | 'desc';
  filters: {
    date: string;
    patientId: string;
    doctorId: string;
  };
}

interface PaginationState {
  internal: TabPagination;
  external: TabPagination;
}
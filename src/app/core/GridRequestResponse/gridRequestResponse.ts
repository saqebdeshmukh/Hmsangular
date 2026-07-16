export interface GridRequest {
  pageNumber: number;
  pageSize: number;
  search?: string;
  sortColumn?: string;
  sortDirection?: string;
  filters?: { [key: string]: string };
}
export interface PagedResponse<T> {
  isSuccess: boolean;
  message: string;
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  data: T[];
}
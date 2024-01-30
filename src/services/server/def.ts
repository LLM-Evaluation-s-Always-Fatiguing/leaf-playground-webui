export interface PaginationParams {
  pageNo: number;
  pageSize: number;
}

export interface PaginationData<T> {
  items: T[];
  current: number;
  totalElements: number;
  totalPages: number;
}

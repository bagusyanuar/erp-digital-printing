/**
 * ApiResponse
 *
 * Interface standar untuk response dari Backend API.
 * Hampir semua endpoint akan mengembalikan struktur yang konsisten
 * dengan field 'message' dan 'data'.
 */
export interface ApiResponse<T = unknown> {
  message: string;
  data: T;
  meta?: {
    pagination: PaginationMeta;
  };
}

export interface PaginationQuery {
  page: number;
  limit: number;
}

export interface PaginationMeta {
  total_items: number;
  total_pages: number;
  current_page: number;
  limit: number;
}

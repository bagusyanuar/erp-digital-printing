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
}

/**
 * HttpError
 * 
 * Standar error yang dilemparkan oleh HttpClient.
 * Digunakan untuk menormalisasi error dari Axios agar layer Infrastructure
 * tidak bergantung langsung pada implementasi library HTTP tertentu.
 */
export class HttpError extends Error {
  constructor(
    public message: string,
    public statusCode?: number,
    public code?: string,
    public data?: unknown,
    public originalError?: unknown
  ) {
    super(message);
    this.name = "HttpError";
    
    // Pastikan stack trace tetap ada (V8)
    if ('captureStackTrace' in Error) {
      (Error as any).captureStackTrace(this, HttpError);
    }
  }

  /**
   * Helper untuk mengecek apakah error adalah instance dari HttpError
   */
  static isHttpError(error: unknown): error is HttpError {
    return error instanceof HttpError;
  }
}

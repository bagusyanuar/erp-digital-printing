/**
 * AppError
 * 
 * Base class untuk semua error di layer Domain/Core.
 * Layer Core tidak boleh tahu tentang detail teknis protokol (HTTP/gRPC).
 */
export class AppError extends Error {
  constructor(
    public message: string,
    public code: string = "APP_ERROR",
    public details?: unknown
  ) {
    super(message);
    this.name = "AppError";
  }
}

/**
 * ValidationError
 * Digunakan untuk error input dari user.
 */
export class ValidationError extends AppError {
  constructor(message: string, public fieldErrors?: Record<string, string[]>) {
    super(message, "VALIDATION_ERROR", fieldErrors);
    this.name = "ValidationError";
  }
}

/**
 * UnauthorizedError
 * Digunakan saat user tidak memiliki akses.
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized access") {
    super(message, "UNAUTHORIZED");
    this.name = "UnauthorizedError";
  }
}

/**
 * NotFoundError
 * Digunakan saat data tidak ditemukan.
 */
export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

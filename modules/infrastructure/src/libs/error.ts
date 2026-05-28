import { HttpError } from "@erp-digital-printing/http";
import { 
  AppError, 
  ValidationError, 
  UnauthorizedError, 
  NotFoundError 
} from "@core/shared/errors/domain.error";

/**
 * mapHttpErrorToDomainError
 * 
 * Mengubah HttpError (dari paket HTTP) menjadi Domain Error (dari Core).
 */
export const mapHttpErrorToDomainError = (error: unknown): Error => {
  if (!(error instanceof HttpError)) {
    return error instanceof Error ? error : new Error(String(error));
  }

  const { statusCode, message, data } = error;
  
  interface BackendErrorData {
    code?: string;
    errors?: Record<string, string[]>;
  }

  const errorData = data as BackendErrorData | undefined;

  switch (statusCode) {
    case 400:
      return new ValidationError(message, errorData?.errors);
    case 401:
      return new UnauthorizedError(message);
    case 404:
      return new NotFoundError("Resource");
    case 500:
      return new AppError("Internal Server Error. Please try again later.", "SERVER_ERROR");
    default:
      return new AppError(message, errorData?.code || "HTTP_ERROR", errorData);
  }
};

/**
 * safeApiCall
 * 
 * Helper untuk membungkus pemanggilan API agar otomatis menangkap 
 * dan menerjemahkan HttpError menjadi Domain Error.
 * Mengurangi boilerplate try-catch di level repository.
 */
export async function safeApiCall<T>(call: () => Promise<T>): Promise<T> {
  try {
    return await call();
  } catch (error) {
    throw mapHttpErrorToDomainError(error);
  }
}

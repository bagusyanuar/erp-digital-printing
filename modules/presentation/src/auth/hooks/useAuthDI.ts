import { useDI } from "../../shared/di/DIContext";
import type { AuthUseCases } from "../../shared/di/DIContext";

/**
 * useAuthDI
 * Selector hook untuk mengambil use cases khusus modul Auth.
 */
export const useAuthDI = (): AuthUseCases => useDI().auth;

import { useDI } from "../../shared/di/DIContext";
import type { GetResellerUseCases } from "../../shared/di/DIContext";

/**
 * useResellerDI
 * Selector hook untuk mengambil use cases khusus modul Reseller.
 */
export const useResellerDI = (): GetResellerUseCases => useDI().reseller;

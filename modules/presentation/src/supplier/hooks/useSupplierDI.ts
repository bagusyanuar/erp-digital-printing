import { useDI } from "../../shared/di/DIContext";
import type { SupplierUseCases } from "../../shared/di/DIContext";

/**
 * useSupplierDI
 * Selector hook untuk mengambil use cases khusus modul Supplier.
 */
export const useSupplierDI = (): SupplierUseCases => useDI().supplier;

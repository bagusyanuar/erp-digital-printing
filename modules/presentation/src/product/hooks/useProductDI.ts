import { useDI } from "../../shared/di/DIContext";
import type { GetProductUseCases } from "../../shared/di/DIContext";

/**
 * useProductDI
 * Selector hook untuk mengambil use cases khusus modul Produk.
 */
export const useProductDI = (): GetProductUseCases => useDI().product;

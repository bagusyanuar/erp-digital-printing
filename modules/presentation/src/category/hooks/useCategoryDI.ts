import { useDI } from "../../shared/di/DIContext";
import type { GetCategoryUseCases } from "../../shared/di/DIContext";

/**
 * useCategoryDI
 * Selector hook untuk mengambil use cases khusus modul Kategori.
 */
export const useCategoryDI = (): GetCategoryUseCases => useDI().category;

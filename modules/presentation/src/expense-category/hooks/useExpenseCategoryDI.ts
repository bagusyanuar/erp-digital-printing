import { useDI } from "../../shared/di/DIContext";
import type { ExpenseCategoryUseCases } from "../../shared/di/DIContext";

/**
 * useExpenseCategoryDI
 * Selector hook untuk mengambil use cases khusus modul Kategori Pengeluaran.
 */
export const useExpenseCategoryDI = (): ExpenseCategoryUseCases => useDI().expenseCategory;

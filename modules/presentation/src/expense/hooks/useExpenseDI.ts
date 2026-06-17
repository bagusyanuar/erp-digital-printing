import { useDI } from "../../shared/di/DIContext";
import type { ExpenseUseCases } from "../../shared/di/DIContext";

/**
 * useExpenseDI
 * Selector hook untuk mengambil use cases khusus modul Pengeluaran.
 */
export const useExpenseDI = (): ExpenseUseCases => useDI().expense;

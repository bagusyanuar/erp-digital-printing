import { useDI } from "../../shared/di/DIContext";
import type { OrderUseCases } from "../../shared/di/DIContext";

/**
 * useOrderDI
 * Selector hook untuk mengakses modul order usecases.
 */
export const useOrderDI = (): OrderUseCases => useDI().order;

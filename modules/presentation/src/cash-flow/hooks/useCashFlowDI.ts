import { useDI } from "../../shared/di/DIContext";
import type { CashFlowUseCases } from "../../shared/di/DIContext";

export const useCashFlowDI = (): CashFlowUseCases => useDI().cashFlow;

import { useDI } from "../../shared/di/DIContext";
import type { CapitalUseCases } from "../../shared/di/DIContext";

export const useCapitalDI = (): CapitalUseCases => useDI().capital;

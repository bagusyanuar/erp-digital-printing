import { useDI } from "../../shared/di/DIContext";
import type { DashboardUseCases } from "../../shared/di/DIContext";

export const useDashboardDI = (): DashboardUseCases => useDI().dashboard;

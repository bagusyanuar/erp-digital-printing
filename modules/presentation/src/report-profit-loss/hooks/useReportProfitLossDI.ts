import { useDI } from "../../shared/di/DIContext";
import type { ReportUseCases } from "../../shared/di/DIContext";

/**
 * useReportProfitLossDI
 * Selector hook untuk mengambil use cases khusus modul Laporan Laba Rugi.
 */
export const useReportProfitLossDI = (): ReportUseCases => useDI().report;

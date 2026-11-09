import { useDI } from "@presentation/shared/di/DIContext";
import type { ReportUseCases } from "@presentation/shared/di/DIContext";

/**
 * useReportSellingDI
 * Selector hook untuk mengambil use cases khusus modul Laporan Penjualan (Export dsb).
 */
export const useReportSellingDI = (): ReportUseCases => useDI().report;


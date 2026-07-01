import type { DashboardWidgets } from "@core/dashboard/domains/models/dashboard.model";
import type { DashboardWidgetsResponse } from "../schemas/dashboard.schema";

export function mapDashboardWidgetsResponseToModel(
  response: DashboardWidgetsResponse,
): DashboardWidgets {
  return {
    totalOmzet: response.total_omzet,
    totalPendapatan: response.total_pendapatan,
    totalPengeluaran: response.total_pengeluaran,
    volumeTransaksi: response.volume_transaksi,
  };
}

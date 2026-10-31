import type {
  ProfitLossModel,
  ProfitLossItemModel,
  ProfitLossSectionModel,
  ProfitLossTrendItemModel,
} from "@core/report";
import type {
  ProfitLossResponse,
  ProfitLossItemResponse,
  ProfitLossSectionResponse,
  ProfitLossTrendItemResponse,
} from "../schemas/report.response";

function mapSectionItem(res: ProfitLossItemResponse): ProfitLossItemModel {
  return {
    id: res.id,
    name: res.name,
    amount: res.amount,
    percentage: res.percentage,
  };
}

function mapSection(res: ProfitLossSectionResponse): ProfitLossSectionModel {
  return {
    title: res.title,
    items: (res.items || []).map(mapSectionItem),
    total: res.total,
  };
}

export function mapProfitLossResponseToModel(res: ProfitLossResponse): ProfitLossModel {
  return {
    period: res.period,
    startDate: res.start_date,
    endDate: res.end_date,
    revenue: mapSection(res.revenue),
    cogs: mapSection(res.cogs),
    grossProfit: {
      amount: res.gross_profit.amount,
      marginPercentage: res.gross_profit.margin_percentage,
    },
    operationalExpenses: mapSection(res.operational_expenses),
    netProfit: {
      amount: res.net_profit.amount,
      marginPercentage: res.net_profit.margin_percentage,
      isProfit: res.net_profit.is_profit,
    },
  };
}

export function mapProfitLossTrendResponseToModel(
  res: ProfitLossTrendItemResponse,
): ProfitLossTrendItemModel {
  return {
    month: res.month,
    periodDate: res.period_date,
    pendapatan: res.pendapatan,
    hpp: res.hpp,
    opex: res.opex,
    labaBersih: res.laba_bersih,
  };
}

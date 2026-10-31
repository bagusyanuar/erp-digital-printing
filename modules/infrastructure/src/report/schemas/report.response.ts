export interface ProfitLossItemResponse {
  id: string;
  name: string;
  amount: number;
  percentage: number;
}

export interface ProfitLossSectionResponse {
  title: string;
  items: ProfitLossItemResponse[];
  total: number;
}

export interface ProfitLossGrossProfitResponse {
  amount: number;
  margin_percentage: number;
}

export interface ProfitLossNetProfitResponse {
  amount: number;
  margin_percentage: number;
  is_profit: boolean;
}

export interface ProfitLossResponse {
  period: string;
  start_date: string;
  end_date: string;
  revenue: ProfitLossSectionResponse;
  cogs: ProfitLossSectionResponse;
  gross_profit: ProfitLossGrossProfitResponse;
  operational_expenses: ProfitLossSectionResponse;
  net_profit: ProfitLossNetProfitResponse;
}

export interface ProfitLossTrendItemResponse {
  month: string;
  period_date: string;
  pendapatan: number;
  hpp: number;
  opex: number;
  laba_bersih: number;
}


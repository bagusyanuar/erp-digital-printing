export interface ProfitLossItemModel {
  id: string;
  name: string;
  amount: number;
  percentage?: number;
}

export interface ProfitLossSectionModel {
  title: string;
  items: ProfitLossItemModel[];
  total: number;
}

export interface ProfitLossGrossProfitModel {
  amount: number;
  marginPercentage: number;
}

export interface ProfitLossNetProfitModel {
  amount: number;
  marginPercentage: number;
  isProfit: boolean;
}

export interface ProfitLossModel {
  period: string;
  startDate: string;
  endDate: string;
  revenue: ProfitLossSectionModel;
  cogs: ProfitLossSectionModel;
  grossProfit: ProfitLossGrossProfitModel;
  operationalExpenses: ProfitLossSectionModel;
  netProfit: ProfitLossNetProfitModel;
}

export interface ProfitLossTrendItemModel {
  month: string;
  periodDate: string;
  pendapatan: number;
  hpp: number;
  opex: number;
  labaBersih: number;
}


export interface FundTransferModel {
  id: string;
  transferDate: string;
  fromAccount: string;
  toAccount: string;
  amount: number;
  notes: string;
  cashierName: string;
  createdAt: string;
}

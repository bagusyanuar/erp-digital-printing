export interface ProfitLossItem {
  id: string;
  name: string;
  amount: number;
  percentage?: number;
}

export interface ProfitLossCategoryGroup {
  id: string;
  title: string;
  items: ProfitLossItem[];
  subtotal: number;
  percentage: number;
}

export interface ProfitLossData {
  period: string;
  startDate: string;
  endDate: string;
  revenue: {
    title: string;
    items: ProfitLossItem[];
    total: number;
  };
  cogs: {
    title: string;
    items: ProfitLossItem[];
    total: number;
  };
  grossProfit: {
    amount: number;
    marginPercentage: number;
  };
  operationalExpenses: {
    title: string;
    items: ProfitLossItem[];
    total: number;
  };
  netProfit: {
    amount: number;
    marginPercentage: number;
    isProfit: boolean;
  };
}

export const MOCK_PROFIT_LOSS_DATA: ProfitLossData = {
  period: "Bulan Ini (Oktober 2026)",
  startDate: "2026-10-01",
  endDate: "2026-10-31",
  revenue: {
    title: "I. Pendapatan Usaha (Revenue)",
    items: [
      { id: "rev-1", name: "Penjualan Banner & Spanduk", amount: 54000000 },
      { id: "rev-2", name: "Penjualan Stiker & Label", amount: 32500000 },
      { id: "rev-3", name: "Penjualan Brosur & Flyer", amount: 24800000 },
      { id: "rev-4", name: "Penjualan Kartu Nama", amount: 12400000 },
      { id: "rev-5", name: "Penjualan Merchandise & Custom", amount: 11200000 },
      { id: "rev-6", name: "Penjualan Display Promosi", amount: 6800000 },
      { id: "rev-7", name: "Penjualan Dokumen & Jilid Buku", amount: 3500000 },
    ],
    total: 145200000,
  },
  cogs: {
    title: "II. Beban Pokok Penjualan (HPP / Biaya Bahan Baku)",
    items: [
      { id: "cogs-1", name: "Bahan Baku Banner & Spanduk (Flexi & Tinta)", amount: 23020000 },
      { id: "cogs-2", name: "Bahan Baku Stiker & Label (Vinyl & Laminasi)", amount: 11870000 },
      { id: "cogs-3", name: "Bahan Baku Brosur & Flyer (Art Paper & Toner)", amount: 13550000 },
      { id: "cogs-4", name: "Bahan Baku Kartu Nama (Art Carton & Box)", amount: 8855000 },
      { id: "cogs-5", name: "Bahan Merchandise (Mug, Sublim & Lanyard)", amount: 5110000 },
      { id: "cogs-6", name: "Rangka & Bahan Display Promosi (Roll Up & X-Banner)", amount: 6380000 },
      { id: "cogs-7", name: "Bahan Dokumen & Kertas HVS Cetak", amount: 2615000 },
    ],
    total: 71400000,
  },
  grossProfit: {
    amount: 73800000, // 145,200,000 - 71,400,000
    marginPercentage: 50.8,
  },
  operationalExpenses: {
    title: "III. Beban Operasional (Operational Expenses)",
    items: [
      { id: "opex-1", name: "Gaji Karyawan & Upah Lembur Operator", amount: 18500000 },
      { id: "opex-2", name: "Listrik 3-Phase, Air & Internet Fiber Workshop", amount: 6400000 },
      { id: "opex-3", name: "Sewa Gedung & Retribusi Workshop", amount: 4200000 },
      { id: "opex-4", name: "Maintenance & Kalibrasi Mesin Berkala", amount: 3100000 },
      { id: "opex-5", name: "Perlengkapan Packing, Lakban & Konsumsi Workshop", amount: 2300000 },
    ],
    total: 34500000,
  },
  netProfit: {
    amount: 39300000, // 73,800,000 - 34,500,000
    marginPercentage: 27.1,
    isProfit: true,
  },
};

export const MOCK_TREND_PROFIT_LOSS = [
  { month: "Mei 2026", pendapatan: 120000000, hpp: 62000000, opex: 31000000, labaBersih: 27000000 },
  { month: "Juni 2026", pendapatan: 135000000, hpp: 68000000, opex: 33000000, labaBersih: 34000000 },
  { month: "Juli 2026", pendapatan: 128000000, hpp: 65000000, opex: 32000000, labaBersih: 31000000 },
  { month: "Agustus 2026", pendapatan: 142000000, hpp: 70000000, opex: 34000000, labaBersih: 38000000 },
  { month: "September 2026", pendapatan: 138000000, hpp: 69000000, opex: 33500000, labaBersih: 35500000 },
  { month: "Oktober 2026", pendapatan: 145200000, hpp: 71400000, opex: 34500000, labaBersih: 39300000 },
];


import React, { useMemo } from "react";
import { Dialog } from "@erp-digital-printing/ui/Dialog";
import { Button } from "@erp-digital-printing/ui/Button";
import {
  LuReceipt,
  LuUser,
  LuCalendar,
  LuPrinter,
  LuClock,
  LuScissors,
  LuCoins,
} from "@erp-digital-printing/ui/icons";

interface SalesTransaction {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerType: "retail" | "reseller" | "corporate";
  totalAmount: number;
  paidAmount: number;
  paymentMethod: string;
  status: "PAID" | "DOWN_PAYMENT" | "UNPAID";
  productCategory: string;
  createdAt: string;
  operatorName: string;
  quantity: number;
}

interface DetailReportSellingProps {
  isOpen: boolean;
  onClose: () => void;
  sale: SalesTransaction | null;
}

// Detailed Mock Data Map based on sale.id
const MOCK_DETAIL_DATA: Record<string, {
  ticketNumber: string;
  designerName: string;
  items: { productName: string; notes?: string; pricePerUnit: number; qty: number; subtotal: number }[];
  payments: {
    id: string;
    payment_type: "DOWN_PAYMENT" | "FULL_PAYMENT" | "REPAYMENT";
    payment_number: number;
    payment_method: string;
    amount: number;
    created_at: string;
    cashier_name: string;
  }[];
}> = {
  "1": {
    ticketNumber: "JOB/2026/06/001",
    designerName: "Rian",
    items: [
      { productName: "Banner Flexi 280gr (Outdoor)", notes: "Finishing: Mata Ayam 4 Pojok", pricePerUnit: 30000, qty: 5, subtotal: 150000 }
    ],
    payments: [
      { id: "p1_1", payment_type: "FULL_PAYMENT", payment_number: 1, payment_method: "QRIS", amount: 150000, created_at: "2026-06-12 10:15:44", cashier_name: "Andi" }
    ]
  },
  "2": {
    ticketNumber: "JOB/2026/06/002",
    designerName: "Siti",
    items: [
      { productName: "Brochure/Flyer AP150 (2 Sisi)", notes: "Finishing: Lipat 3 & Laminasi Glossy", pricePerUnit: 4500, qty: 1000, subtotal: 4500000 }
    ],
    payments: [
      { id: "p2_1", payment_type: "DOWN_PAYMENT", payment_number: 1, payment_method: "Transfer Bank", amount: 2000000, created_at: "2026-06-13 11:30:10", cashier_name: "Siti" }
    ]
  },
  "3": {
    ticketNumber: "JOB/2026/06/003",
    designerName: "Budi",
    items: [
      { productName: "Sticker Vinyl Ritrama + Laminasi", notes: "Finishing: Kiss Cut Bulat 5cm", pricePerUnit: 3400, qty: 250, subtotal: 850000 }
    ],
    payments: [
      { id: "p3_1", payment_type: "FULL_PAYMENT", payment_number: 1, payment_method: "Cash", amount: 850000, created_at: "2026-06-14 16:45:00", cashier_name: "Budi" }
    ]
  },
  "4": {
    ticketNumber: "JOB/2026/06/004",
    designerName: "Rian",
    items: [
      { productName: "Print Dokumen HVS A4 80gr", notes: "Jilid Spiral Kawat Plastik", pricePerUnit: 500, qty: 150, subtotal: 75000 }
    ],
    payments: [
      { id: "p4_1", payment_type: "FULL_PAYMENT", payment_number: 1, payment_method: "QRIS", amount: 75000, created_at: "2026-06-15 09:20:11", cashier_name: "Andi" }
    ]
  },
  "5": {
    ticketNumber: "JOB/2026/06/005",
    designerName: "Siti",
    items: [
      { productName: "Merchandise Kaos Sablon DTF", notes: "Bahan Cotton Combed 30s Hitam", pricePerUnit: 40000, qty: 8, subtotal: 320000 }
    ],
    payments: [] // Belum bayar / Unpaid
  },
  "6": {
    ticketNumber: "JOB/2026/06/006",
    designerName: "Budi",
    items: [
      { productName: "Banner Korea 440gr (High Res)", notes: "Finishing: Slongsong Kanan-Kiri", pricePerUnit: 312500, qty: 40, subtotal: 12500000 }
    ],
    payments: [
      { id: "p6_1", payment_type: "FULL_PAYMENT", payment_number: 1, payment_method: "Transfer Bank", amount: 12500000, created_at: "2026-06-16 13:05:52", cashier_name: "Siti" }
    ]
  },
  "7": {
    ticketNumber: "JOB/2026/06/007",
    designerName: "Rian",
    items: [
      { productName: "Sticker Vinyl Transparan", notes: "Finishing: Die Cut Pola Custom", pricePerUnit: 3428, qty: 350, subtotal: 1200000 }
    ],
    payments: [
      { id: "p7_1", payment_type: "DOWN_PAYMENT", payment_number: 1, payment_method: "QRIS", amount: 600000, created_at: "2026-06-17 14:50:33", cashier_name: "Budi" }
    ]
  },
  "8": {
    ticketNumber: "JOB/2026/06/008",
    designerName: "Siti",
    items: [
      { productName: "Kartu Nama Art Carton 260gr", notes: "Finishing: Box Plastik & Round Corner", pricePerUnit: 22500, qty: 2, subtotal: 45000 }
    ],
    payments: [
      { id: "p8_1", payment_type: "FULL_PAYMENT", payment_number: 1, payment_method: "Cash", amount: 45000, created_at: "2026-06-18 10:10:00", cashier_name: "Rian" }
    ]
  }
};

const DetailReportSelling: React.FC<DetailReportSellingProps> = ({
  isOpen,
  onClose,
  sale,
}) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Resolve detailed data dynamically if not hardcoded
  const detailedInfo = useMemo(() => {
    if (!sale) return null;
    const existing = MOCK_DETAIL_DATA[sale.id];
    if (existing) return existing;

    // Fallback dynamic generation
    const mockJobNumber = sale.invoiceNumber.replace("INV", "JOB");
    const mockDesigner = sale.operatorName === "Andi" ? "Rian" : sale.operatorName === "Siti" ? "Budi" : "Siti";
    
    const items = [
      {
        productName: `${sale.productCategory} Custom`,
        notes: "Finishing Standard",
        pricePerUnit: sale.totalAmount / (sale.quantity || 1),
        qty: sale.quantity || 1,
        subtotal: sale.totalAmount,
      }
    ];

    const payments = [];
    if (sale.status === "PAID") {
      payments.push({
        id: `gen_p_${sale.id}`,
        payment_type: "FULL_PAYMENT" as const,
        payment_number: 1,
        payment_method: sale.paymentMethod,
        amount: sale.totalAmount,
        created_at: `${sale.createdAt} 10:00:00`,
        cashier_name: sale.operatorName,
      });
    } else if (sale.status === "DOWN_PAYMENT") {
      payments.push({
        id: `gen_p_${sale.id}`,
        payment_type: "DOWN_PAYMENT" as const,
        payment_number: 1,
        payment_method: sale.paymentMethod,
        amount: sale.paidAmount,
        created_at: `${sale.createdAt} 10:00:00`,
        cashier_name: sale.operatorName,
      });
    }

    return {
      ticketNumber: mockJobNumber,
      designerName: mockDesigner,
      items,
      payments,
    };
  }, [sale]);

  if (!sale || !detailedInfo) return null;

  const outstanding = sale.totalAmount - sale.paidAmount;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      className="rounded-3xl p-6 bg-card border border-border/50 text-foreground overflow-hidden max-h-[90vh] w-full max-w-4xl flex flex-col"
      showCloseButton={true}
    >
      <div className="space-y-5 flex flex-col overflow-hidden h-[75vh] max-h-[75vh]">
        {/* Dialog Header */}
        <div className="flex flex-col gap-1 border-b border-border/30 pb-4 shrink-0">
          <h2 className="text-xl font-black tracking-tight text-foreground flex items-center gap-2">
            <LuReceipt size={20} className="text-primary" />
            Detail Rincian Belanja & Finansial
          </h2>
          <p className="text-xs text-muted-foreground font-semibold">
            Invoice: <span className="font-mono text-foreground font-bold">{sale.invoiceNumber}</span>
          </p>
        </div>

        {/* Two-Column Layout */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
          
          {/* LEFT COLUMN: Dokumen, Produk & Desain (Scrollable) */}
          <div className="flex flex-col h-full overflow-y-auto pr-1 scrollbar-thin space-y-5">
            {/* Utama & Pelanggan Box */}
            <div className="bg-muted/30 p-4 rounded-2xl border border-border/40 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-muted-foreground uppercase tracking-wider block">
                    Pelanggan
                  </span>
                  <span className="font-bold text-foreground text-xs block">
                    {sale.customerName}
                  </span>
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border leading-none ${
                    sale.customerType === "corporate"
                      ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-900/50"
                      : sale.customerType === "reseller"
                      ? "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-900/50"
                      : "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/30 dark:text-slate-400 dark:border-slate-800/50"
                  }`}>
                    {sale.customerType === "reseller" ? "Biro / Reseller" : sale.customerType === "corporate" ? "Corporate" : "Retail"}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-muted-foreground uppercase tracking-wider block">
                    Admin Pembuat Nota
                  </span>
                  <span className="font-bold text-foreground text-xs block">
                    {sale.operatorName}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-semibold block">
                    Kasir/CS Penjualan
                  </span>
                </div>
              </div>

              {/* Info Tiket Kerja (Desain) */}
              <div className="border-t border-border/30 pt-3 grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-muted-foreground uppercase tracking-wider block">
                    Nomor Tiket / Job
                  </span>
                  <span className="font-mono font-black text-foreground text-xs bg-muted px-2 py-0.5 rounded border border-border inline-block">
                    {detailedInfo.ticketNumber}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-muted-foreground uppercase tracking-wider block">
                    Desainer Pembuat Tiket
                  </span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center">
                      <LuUser size={10} className="text-primary" />
                    </div>
                    <span className="font-bold text-foreground text-xs">
                      {detailedInfo.designerName}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Item List */}
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block">
                Daftar Item Cetak
              </span>
              <div className="border border-border/40 rounded-xl overflow-hidden divide-y divide-border/20">
                {detailedInfo.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-card flex justify-between gap-4 text-xs font-semibold hover:bg-muted/10 transition-colors"
                  >
                    <div>
                      <span className="text-foreground block font-bold">
                        {idx + 1}. {item.productName}
                      </span>
                      {item.notes && (
                        <span className="text-[10px] text-muted-foreground block font-medium mt-1">
                          Spesifikasi: {item.notes}
                        </span>
                      )}
                      <span className="text-[10px] text-primary font-bold block mt-1">
                        {formatCurrency(item.pricePerUnit)} x {item.qty} Qty
                      </span>
                    </div>
                    <span className="font-black text-foreground shrink-0 self-center">
                      {formatCurrency(item.subtotal)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Finansial & Riwayat Pembayaran (Flex Layout, Fixed Summary Bottom) */}
          <div className="flex flex-col h-full overflow-hidden space-y-5 justify-between">
            {/* Timeline Pembayaran */}
            <div className="flex flex-col flex-1 min-h-0 space-y-2.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block shrink-0">
                Riwayat Transaksi Masuk
              </span>
              <div className="flex-1 bg-muted/15 border border-border/40 rounded-2xl p-4 overflow-y-auto scrollbar-thin">
                {detailedInfo.payments.length > 0 ? (
                  <div className="relative border-l border-border pl-4 space-y-4">
                    {detailedInfo.payments.map((pay) => (
                      <div key={pay.id} className="relative flex flex-col gap-1.5">
                        {/* Circle Indicator */}
                        <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100 dark:ring-emerald-950/40" />
                        <div className="flex justify-between items-start gap-4 text-xs font-semibold">
                          <div>
                            <span className="text-foreground font-black block">
                              {pay.payment_type === "DOWN_PAYMENT" 
                                ? "Pembayaran Awal (DP)" 
                                : pay.payment_type === "FULL_PAYMENT"
                                ? "Lunas / Pembayaran Langsung"
                                : `Pelunasan #${pay.payment_number}`}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-medium block mt-0.5">
                              {pay.created_at} • Kasir: {pay.cashier_name}
                            </span>
                          </div>
                          <span className="font-black text-emerald-600 dark:text-emerald-400 shrink-0">
                            {formatCurrency(pay.amount)}
                          </span>
                        </div>
                        {/* Payment Method Badge */}
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border leading-none bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50">
                            {pay.payment_method}
                          </span>
                        </div>
                      </div>
                    ))}

                    {/* Sisa Piutang Info in Timeline */}
                    {outstanding > 0 && (
                      <div className="relative">
                        <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-4 ring-amber-100 dark:ring-amber-950/40 animate-pulse" />
                        <div className="flex justify-between items-start gap-4 text-xs font-semibold">
                          <div>
                            <span className="text-amber-600 dark:text-amber-400 font-black block">
                              Sisa Tagihan (Piutang)
                            </span>
                            <span className="text-[10px] text-muted-foreground font-medium block mt-0.5">
                              Menunggu pelunasan
                            </span>
                          </div>
                          <span className="font-black text-rose-500 shrink-0">
                            {formatCurrency(outstanding)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 space-y-1.5">
                    <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto text-rose-500">
                      <LuClock size={16} />
                    </div>
                    <span className="text-xs font-bold text-muted-foreground block">
                      Belum ada riwayat pembayaran
                    </span>
                    <span className="text-[9px] text-muted-foreground block font-medium max-w-[200px] mx-auto">
                      Transaksi ini berstatus piutang belum dibayar (UNPAID) atau baru di-input.
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Financial Summary Box (Fixed at the Bottom) */}
            <div className="border-t border-border/30 pt-4 space-y-2.5 text-xs font-semibold shrink-0">
              <div className="flex justify-between items-center text-muted-foreground">
                <span>Total Belanja</span>
                <span className="font-bold text-foreground">
                  {formatCurrency(sale.totalAmount)}
                </span>
              </div>
              <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400">
                <span>Jumlah Telah Terbayar</span>
                <span className="font-black">
                  {formatCurrency(sale.paidAmount)}
                </span>
              </div>
              <div className="flex justify-between items-center border-t border-dashed border-border/30 pt-2 font-black">
                <span className="text-primary uppercase tracking-wider text-[10px]">
                  Sisa Tagihan
                </span>
                <span className="text-sm text-rose-500">
                  {outstanding > 0 ? formatCurrency(outstanding) : "-"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons / Actions */}
        <div className="flex justify-end gap-2.5 border-t border-border/20 pt-4 shrink-0">
          <Button
            variant="outline"
            className="rounded-xl text-xs font-bold px-4 border-border/50 h-10 hover:bg-muted"
            onClick={onClose}
          >
            Tutup
          </Button>
          <Button
            className="rounded-xl text-xs font-black px-4 bg-primary text-primary-foreground flex items-center gap-1.5 h-10 shadow-md shadow-primary/20 hover:opacity-90 active:scale-95 transition-all"
            onClick={() => {
              alert(`Mencetak struk untuk nota ${sale.invoiceNumber}...`);
            }}
          >
            <LuPrinter size={13} />
            Cetak Struk
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

export default DetailReportSelling;

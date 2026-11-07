import React from "react";
import { Card, CardContent } from "@erp-digital-printing/ui/Card";
import {
  LuWallet,
  LuCircleCheck,
  LuUsers,
} from "@erp-digital-printing/ui/icons";
import type { CustomerReceivableSummaryModel } from "@core/receivable/domains/models/receivable.model";

interface ReceivableSummaryWidgetsProps {
  summary?: CustomerReceivableSummaryModel;
  isLoading?: boolean;
}

const formatCurrency = (val: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(val);
};

export const ReceivableSummaryWidgets: React.FC<ReceivableSummaryWidgetsProps> = ({
  summary,
  isLoading = false,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* 1. Total Piutang Aktif */}
      <Card className="rounded-2xl border-border/50 shadow-sm bg-gradient-to-br from-card via-card to-amber-500/5">
        <CardContent className="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
              Total Piutang Berjalan
            </span>
            <h3 className="text-xl font-black text-amber-600 dark:text-amber-500 tracking-tight">
              {isLoading ? "..." : formatCurrency(summary?.totalActiveReceivable ?? 0)}
            </h3>
            <p className="text-[10px] text-muted-foreground font-medium">
              Akumulasi nota gantung seluruh customer
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-500 shrink-0">
            <LuWallet size={20} />
          </div>
        </CardContent>
      </Card>

      {/* 
        NOTE KEDEPAN:
        Jika klien nantinya membutuhkan fitur 'Jatuh Tempo Pembayaran' (Aging / Overdue Warning),
        aktifkan kembali card ini dan model summary.totalOverdueReceivable:
        <Card className="rounded-2xl border-border/50 shadow-sm bg-gradient-to-br from-card via-card to-rose-500/5">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                Lewat Jatuh Tempo
              </span>
              <h3 className="text-xl font-black text-rose-600 dark:text-rose-500 tracking-tight">
                {isLoading ? "..." : formatCurrency(summary?.totalOverdueReceivable ?? 0)}
              </h3>
              <p className="text-[10px] text-rose-500/80 font-medium">
                Piutang yang telah melampaui tanggal tempo
              </p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-500 shrink-0">
              <LuTriangleAlert size={20} />
            </div>
          </CardContent>
        </Card>
      */}

      {/* 2. Total Piutang Tertagih */}
      <Card className="rounded-2xl border-border/50 shadow-sm bg-gradient-to-br from-card via-card to-emerald-500/5">
        <CardContent className="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
              Total Tertagih (Lunas)
            </span>
            <h3 className="text-xl font-black text-emerald-600 dark:text-emerald-500 tracking-tight">
              {isLoading ? "..." : formatCurrency(summary?.totalSettledReceivable ?? 0)}
            </h3>
            <p className="text-[10px] text-muted-foreground font-medium">
              Riwayat piutang yang telah terlunasi
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-500 shrink-0">
            <LuCircleCheck size={20} />
          </div>
        </CardContent>
      </Card>

      {/* 3. Customer Berpiutang */}
      <Card className="rounded-2xl border-border/50 shadow-sm bg-gradient-to-br from-card via-card to-primary/5">
        <CardContent className="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
              Customer Berpiutang
            </span>
            <h3 className="text-xl font-black text-foreground tracking-tight">
              {isLoading ? "..." : `${summary?.activeCustomerCount ?? 0} Pelanggan`}
            </h3>
            <p className="text-[10px] text-muted-foreground font-medium">
              Pelanggan dengan kewajiban tagihan aktif
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <LuUsers size={20} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

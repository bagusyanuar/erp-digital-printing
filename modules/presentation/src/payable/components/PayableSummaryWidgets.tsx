import React from "react";
import { Card, CardContent } from "@erp-digital-printing/ui/Card";
import {
  LuReceipt,
  LuCircleCheck,
  LuBuilding2,
} from "@erp-digital-printing/ui/icons";
import type { VendorPayableSummaryModel } from "@core/payable/domains/models/payable.model";

interface PayableSummaryWidgetsProps {
  summary?: VendorPayableSummaryModel;
  isLoading?: boolean;
}

const formatCurrency = (val: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(val);
};

export const PayableSummaryWidgets: React.FC<PayableSummaryWidgetsProps> = ({
  summary,
  isLoading = false,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* 1. Total Hutang Berjalan */}
      <Card className="rounded-xl border-border/50 shadow-sm bg-gradient-to-br from-card via-card to-amber-500/5">
        <CardContent className="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
              Total Hutang Berjalan
            </span>
            <h3 className="text-xl font-black text-amber-600 dark:text-amber-500 tracking-tight">
              {isLoading ? "..." : formatCurrency(summary?.totalActivePayable ?? 0)}
            </h3>
            <p className="text-[10px] text-muted-foreground font-medium">
              Sisa tagihan tempo ke supplier & vendor
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-500 shrink-0">
            <LuReceipt size={20} />
          </div>
        </CardContent>
      </Card>

      {/* 2. Total Hutang Lunas (Terlunasi) */}
      <Card className="rounded-xl border-border/50 shadow-sm bg-gradient-to-br from-card via-card to-emerald-500/5">
        <CardContent className="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
              Total Terlunasi
            </span>
            <h3 className="text-xl font-black text-emerald-600 dark:text-emerald-500 tracking-tight">
              {isLoading ? "..." : formatCurrency(summary?.totalSettledPayable ?? 0)}
            </h3>
            <p className="text-[10px] text-muted-foreground font-medium">
              Riwayat nota vendor yang telah lunas
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <LuCircleCheck size={20} />
          </div>
        </CardContent>
      </Card>

      {/* 3. Vendor Berhutang */}
      <Card className="rounded-xl border-border/50 shadow-sm bg-gradient-to-br from-card via-card to-primary/5">
        <CardContent className="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
              Vendor Aktif
            </span>
            <h3 className="text-xl font-black text-foreground tracking-tight">
              {isLoading ? "..." : `${summary?.activeVendorCount ?? 0} Vendor`}
            </h3>
            <p className="text-[10px] text-muted-foreground font-medium">
              Penyedia/mitra dengan invoice gantung
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <LuBuilding2 size={20} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

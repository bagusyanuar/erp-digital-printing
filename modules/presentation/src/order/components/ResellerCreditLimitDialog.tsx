import React from "react";
import { Dialog } from "@erp-digital-printing/ui/Dialog";
import { Button } from "@erp-digital-printing/ui/Button";
import {
  LuShieldAlert,
  LuShieldCheck,
  FiAlertTriangle,
  LuUser,
  LuCreditCard,
  LuCoins,
  LuLoader,
  LuInfo,
  LuReceipt,
  LuPrinter,
} from "@erp-digital-printing/ui/icons";
import type { ResellerModel } from "@core/reseller/domains/models";

interface ResellerCreditLimitDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onCancelPaymentMode: () => void;
  reseller?: ResellerModel | null;
  isLoadingReseller?: boolean;
  isResellerOrder: boolean;
  customerName: string;
  ticketNo: string;
  orderAmount: number;
  isProcessing?: boolean;
  isPartialPayment?: boolean;
  paidAmount?: number;
}

const formatCurrency = (val: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(val);
};

export const ResellerCreditLimitDialog: React.FC<
  ResellerCreditLimitDialogProps
> = ({
  isOpen,
  onClose,
  onConfirm,
  onCancelPaymentMode,
  reseller,
  isLoadingReseller = false,
  isResellerOrder,
  customerName,
  ticketNo,
  orderAmount,
  isProcessing = false,
  isPartialPayment = false,
  paidAmount = 0,
}) => {
  const creditLimit = reseller?.creditLimit ?? 0;
  const outstandingDebt = reseller?.outstandingDebt ?? 0;
  const remainingLimit = creditLimit - outstandingDebt;
  const remainingAfterOrder = remainingLimit - orderAmount;
  const isOverlimit = remainingAfterOrder < 0;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      className="max-w-xl w-full p-6 rounded-3xl bg-card border border-border/60 text-foreground overflow-hidden max-h-[90vh] flex flex-col shadow-2xl"
      showCloseButton={true}
    >
      <div className="space-y-5 flex flex-col min-h-0">
        {/* Header */}
        <div className="flex items-start gap-3 border-b border-border/40 pb-4 pr-10">
          <div
            className={`p-2.5 rounded-2xl shrink-0 ${
              !isResellerOrder
                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                : isOverlimit
                  ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                  : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            }`}
          >
            {!isResellerOrder ? (
              <FiAlertTriangle size={24} />
            ) : isOverlimit ? (
              <LuShieldAlert size={24} />
            ) : (
              <LuShieldCheck size={24} />
            )}
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight text-foreground">
              {isPartialPayment
                ? "Peringatan Sisa Tempo / Piutang Reseller"
                : "Peringatan Limit Piutang Reseller"}
            </h2>
            <p className="text-xs text-muted-foreground font-semibold">
              {isPartialPayment
                ? `Pembayaran parsial menyisakan hutang tempo ${formatCurrency(orderAmount)}. Pastikan sisa limit mencukupi.`
                : "Verifikasi sisa saldo limit kredit sebelum mencatat transaksi sebagai piutang (tempo)."}
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="space-y-4 overflow-y-auto max-h-[60vh] pr-1 scrollbar-thin">
          {isLoadingReseller ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-2 text-muted-foreground">
              <LuLoader size={28} className="animate-spin text-primary" />
              <span className="text-xs font-bold">
                Memuat informasi saldo limit reseller...
              </span>
            </div>
          ) : !isResellerOrder ? (
            /* Bukan Akun Reseller Terdaftar */
            <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 space-y-3">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-bold text-sm">
                <FiAlertTriangle size={18} />
                <span>Pelanggan Non-Reseller (Walk-In)</span>
              </div>
              <p className="text-xs text-amber-800 dark:text-amber-200/90 leading-relaxed font-medium">
                Pelanggan <strong className="font-bold">{customerName}</strong>{" "}
                bukan merupakan akun Reseller terdaftar, sehingga tidak memiliki
                plafon limit kredit piutang otomatis.
              </p>
              <div className="p-3 rounded-xl bg-card/60 border border-amber-500/20 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">No. Tiket:</span>
                  <span className="font-mono font-bold text-foreground">
                    {ticketNo}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Tagihan:</span>
                  <span className="font-mono font-bold text-foreground">
                    {formatCurrency(orderAmount)}
                  </span>
                </div>
              </div>
            </div>
          ) : reseller ? (
            /* Reseller Terdaftar: Tampilkan Rincian Limit */
            <div className="space-y-4">
              {/* Profil Reseller */}
              <div className="p-3.5 rounded-2xl bg-muted/20 border border-border/50 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <LuUser size={16} />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block">
                      Akun Reseller
                    </span>
                    <span className="font-bold text-foreground text-sm block">
                      {reseller.name}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-muted-foreground block">
                    No. Telepon
                  </span>
                  <span className="font-mono font-semibold text-foreground text-xs">
                    {reseller.phone || "-"}
                  </span>
                </div>
              </div>

              {/* Grid 3 Kartu Saldo Limit */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Plafon Limit */}
                <div className="p-3.5 rounded-2xl bg-card border border-border/60 shadow-xs space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Plafon Limit
                  </span>
                  <span className="text-sm font-black font-mono text-foreground block">
                    {formatCurrency(creditLimit)}
                  </span>
                  <span className="text-[10px] text-muted-foreground block">
                    Batas Maksimal
                  </span>
                </div>

                {/* Hutang Berjalan */}
                <div className="p-3.5 rounded-2xl bg-card border border-border/60 shadow-xs space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 block">
                    Hutang Berjalan
                  </span>
                  <span className="text-sm font-black font-mono text-rose-600 dark:text-rose-400 block">
                    {formatCurrency(outstandingDebt)}
                  </span>
                  <span className="text-[10px] text-muted-foreground block">
                    Belum Lunas
                  </span>
                </div>

                {/* Sisa Saldo Limit */}
                <div
                  className={`p-3.5 rounded-2xl border shadow-xs space-y-1 ${
                    remainingLimit <= 0
                      ? "bg-rose-500/10 border-rose-500/30"
                      : "bg-emerald-500/10 border-emerald-500/30"
                  }`}
                >
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider block ${
                      remainingLimit <= 0
                        ? "text-rose-600 dark:text-rose-400"
                        : "text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    Sisa Saldo Limit
                  </span>
                  <span
                    className={`text-sm font-black font-mono block ${
                      remainingLimit <= 0
                        ? "text-rose-600 dark:text-rose-400"
                        : "text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    {formatCurrency(remainingLimit)}
                  </span>
                  <span className="text-[10px] text-muted-foreground block">
                    Sebelum Transaksi
                  </span>
                </div>
              </div>

              {/* Rincian Transaksi Piutang Ini */}
              <div className="p-4 rounded-2xl bg-muted/20 border border-border/50 space-y-2 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-border/30">
                  <span className="font-semibold text-muted-foreground flex items-center gap-1.5">
                    <LuReceipt size={14} className="text-primary" />
                    {isPartialPayment
                      ? `Sisa Tagihan Tempo (${ticketNo})`
                      : `Tagihan Piutang Nota (${ticketNo})`}
                  </span>
                  <div className="text-right">
                    <span className="font-mono font-bold text-foreground text-sm block">
                      {formatCurrency(orderAmount)}
                    </span>
                    {isPartialPayment && paidAmount > 0 && (
                      <span className="text-[10px] text-muted-foreground block">
                        Sudah Diinput: {formatCurrency(paidAmount)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="font-bold text-foreground">
                    Estimasi Sisa Limit Setelah Transaksi:
                  </span>
                  <span
                    className={`font-mono font-black text-sm ${
                      remainingAfterOrder < 0
                        ? "text-rose-600 dark:text-rose-400"
                        : "text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    {formatCurrency(remainingAfterOrder)}
                  </span>
                </div>
              </div>

              {/* Banner Status Callout */}
              {isOverlimit ? (
                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5">
                  <LuShieldAlert size={18} className="shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                  <div className="space-y-0.5">
                    <span className="font-bold block">
                      Peringatan: Melebihi Batas Limit (Overlimit)!
                    </span>
                    <p className="text-[11px] leading-relaxed opacity-90">
                      Total tagihan piutang melampaui sisa plafon limit kredit
                      reseller sebesar{" "}
                      <strong className="font-mono font-bold">
                        {formatCurrency(Math.abs(remainingAfterOrder))}
                      </strong>
                      . Pastikan Anda telah mengonfirmasi persetujuan pihak
                      manajemen / owner.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2.5">
                  <LuShieldCheck size={18} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <span className="font-bold block">
                      Limit Kredit Mencukupi
                    </span>
                    <p className="text-[11px] opacity-90">
                      Sisa plafon kredit reseller mencukupi untuk transaksi
                      piutang ini.
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center gap-3 border-t border-border/40 pt-4 mt-auto">
          <Button
            type="button"
            variant={isOverlimit && isResellerOrder ? "default" : "outline"}
            onClick={onCancelPaymentMode}
            className={`flex-1 h-10 rounded-xl font-bold text-xs ${
              isOverlimit && isResellerOrder
                ? "bg-primary text-primary-foreground shadow-md"
                : "border-border/60 hover:bg-muted"
            }`}
          >
            {isPartialPayment
              ? "Lunasi Penuh (Tanpa Tempo)"
              : "Ganti Metode (Cash)"}
          </Button>

          <Button
            type="button"
            disabled={(isOverlimit && isResellerOrder) || isProcessing}
            onClick={onConfirm}
            className={`flex-1 h-10 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md ${
              isOverlimit && isResellerOrder
                ? "bg-muted text-muted-foreground cursor-not-allowed shadow-none"
                : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/25"
            }`}
          >
            {isProcessing ? (
              <>
                <LuLoader size={14} className="animate-spin" />
                <span>Memproses...</span>
              </>
            ) : isOverlimit && isResellerOrder ? (
              <>
                <LuShieldAlert size={14} />
                <span>Limit Tidak Cukup</span>
              </>
            ) : (
              <>
                <LuPrinter size={14} />
                <span>Konfirmasi & Bayar</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

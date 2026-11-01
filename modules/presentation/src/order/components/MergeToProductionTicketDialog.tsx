import React, { useState } from "react";
import { Dialog } from "@erp-digital-printing/ui/Dialog";
import { Button } from "@erp-digital-printing/ui/Button";
import {
  LuLayers,
  LuUser,
  LuSearch,
  LuArrowRight,
  LuInfo,
} from "@erp-digital-printing/ui/icons";
import { TextField } from "@erp-digital-printing/ui/TextField";
import type { OrderTransaction } from "../hooks/useOrder";

interface MergeToProductionTicketDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sourceRetailTicketNo: string;
  retailItemCount: number;
  retailTotalAmount: number;
  productionOrders: OrderTransaction[];
  onMerge: (targetProductionOrderId: string) => void;
}

const formatCurrency = (val: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(val);
};

export const MergeToProductionTicketDialog: React.FC<
  MergeToProductionTicketDialogProps
> = ({
  isOpen,
  onClose,
  sourceRetailTicketNo,
  retailItemCount,
  retailTotalAmount,
  productionOrders,
  onMerge,
}) => {
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const pendingProductionOrders = productionOrders.filter((order) => {
    const isPending =
      order.status === "NEED_PAYMENT" || order.status === "PARTIAL_PAID";
    const matchSearch =
      order.ticketNo.toLowerCase().includes(search.toLowerCase()) ||
      order.customerName.toLowerCase().includes(search.toLowerCase());
    return isPending && matchSearch;
  });

  const handleConfirmMerge = () => {
    if (!selectedTicketId) return;
    onMerge(selectedTicketId);
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      className="rounded-3xl p-6 bg-card border border-border/50 text-foreground overflow-hidden max-h-[90vh] flex flex-col"
      showCloseButton={true}
    >
      <div className="space-y-5 flex flex-col">
        {/* Header */}
        <div className="flex flex-col gap-1 border-b border-border/30 pb-4 pr-10">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
              <LuLayers size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-foreground">
                Gabungkan ke Tiket Produksi
              </h2>
              <p className="text-xs text-muted-foreground font-semibold">
                Pindahkan seluruh item dari nota ritel ke tiket desainer.
              </p>
            </div>
          </div>
        </div>

        {/* Source Retail Order Summary Banner */}
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 block">
              Sumber Nota Ritel:
            </span>
            <span className="font-mono font-bold text-xs text-foreground block">
              {sourceRetailTicketNo} ({retailItemCount} Item)
            </span>
          </div>
          <span className="text-xs font-black text-amber-700 dark:text-amber-400">
            {formatCurrency(retailTotalAmount)}
          </span>
        </div>

        {/* Search Bar */}
        <div className="p-0.5">
          <TextField
            placeholder="Cari No. Tiket atau Nama Pelanggan Cetak..."
            prefixIcon={LuSearch}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full focus-visible:ring-offset-0 focus-visible:ring-2 focus-visible:ring-primary"
          />
        </div>

        {/* Production Tickets List */}
        <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1 scrollbar-thin">
          <span className="text-xs font-bold text-foreground block">
            Pilih Tiket Produksi Tujuan:
          </span>

          {pendingProductionOrders.length > 0 ? (
            pendingProductionOrders.map((prodOrder) => {
              const isSelected = selectedTicketId === prodOrder.id;
              return (
                <div
                  key={prodOrder.id}
                  onClick={() => setSelectedTicketId(prodOrder.id)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? "border-primary bg-primary/10 shadow-sm ring-2 ring-primary/20"
                      : "border-border/60 bg-muted/20 hover:bg-muted/40"
                  }`}
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs bg-card px-2 py-0.5 rounded border border-border/50 text-foreground">
                        {prodOrder.ticketNo}
                      </span>
                      <span className="text-[10px] font-semibold text-muted-foreground truncate">
                        {prodOrder.items.length} Item Cetak
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                      <LuUser size={13} className="text-primary/70 shrink-0" />
                      <span className="truncate">{prodOrder.customerName}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-black text-foreground block">
                      {formatCurrency(prodOrder.grandTotal || 0)}
                    </span>
                    <span className="text-[10px] font-bold text-primary flex items-center gap-1 justify-end mt-0.5">
                      {isSelected ? "Dipilih" : "Pilih"}
                      <LuArrowRight size={10} />
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center space-y-2">
              <LuInfo size={28} className="mx-auto text-muted-foreground/60" />
              <p className="text-xs text-muted-foreground font-semibold">
                Tidak ada tiket produksi aktif yang menunggu pembayaran.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-border/30 pt-4 mt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="h-9 px-4 rounded-xl font-bold border-border/60 hover:bg-muted text-xs"
          >
            Batal
          </Button>
          <Button
            type="button"
            disabled={!selectedTicketId}
            onClick={handleConfirmMerge}
            className="h-9 px-5 rounded-xl font-bold bg-primary text-primary-foreground shadow-md text-xs disabled:opacity-50"
          >
            Ya, Gabungkan ke Tiket Ini
          </Button>
        </div>
      </div>
    </Dialog>
  );
};


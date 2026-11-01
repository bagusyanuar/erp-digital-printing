import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog } from "@erp-digital-printing/ui/Dialog";
import { Button } from "@erp-digital-printing/ui/Button";
import { TextField } from "@erp-digital-printing/ui/TextField";
import {
  LuShoppingBag,
  LuPlus,
  LuTrash2,
  LuUser,
  LuPhone,
  LuMinus,
  LuLoader,
  LuPackage,
} from "@erp-digital-printing/ui/icons";
import { useProductDI } from "../../product/hooks/useProductDI";
import { productKeys } from "@infrastructure/product/keys";
import type { RetailProductItem } from "../types/retail.type";
import type { OrderItem } from "../hooks/useOrder";

interface CreateRetailOrderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateOrder: (
    customerName: string,
    customerPhone: string,
    initialItems: OrderItem[],
  ) => void;
  isSubmitting?: boolean;
}

const formatCurrency = (val: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(val);
};

export const CreateRetailOrderDialog: React.FC<CreateRetailOrderDialogProps> = ({
  isOpen,
  onClose,
  onCreateOrder,
  isSubmitting = false,
}) => {
  const [customerName, setCustomerName] = useState("Customer Walk In");
  const [customerPhone, setCustomerPhone] = useState("");
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);

  const { getProductsUseCase } = useProductDI();

  // Fetch real non-production products from backend
  const { data: productResponse, isLoading } = useQuery({
    queryKey: productKeys.list({ is_production: false, limit: 100 }),
    queryFn: () =>
      getProductsUseCase.execute({ is_production: false, limit: 100 }),
    enabled: isOpen,
    staleTime: 30_000,
  });

  const products = useMemo((): RetailProductItem[] => {
    return (productResponse?.data ?? []).map((p) => {
      const firstVariant = p.variants?.[0];
      const tierPrice = firstVariant?.price_tiers?.[0]?.price_per_unit;
      const price =
        tierPrice !== undefined && tierPrice > 0
          ? tierPrice
          : p.base_price || 0;

      return {
        id: p.id || "",
        variantId: firstVariant?.id || p.id || "",
        name: p.name,
        categoryName: p.category_name || "Ritel",
        price,
        uom: p.uom || "pcs",
        isProduction: false,
      };
    });
  }, [productResponse]);

  const handleAddItem = (prod: RetailProductItem) => {
    setCartItems((prev) => {
      const existing = prev.find(
        (it) => it.productVariantId === prod.variantId,
      );
      if (existing) {
        const newQty = existing.qty + 1;
        return prev.map((it) =>
          it.id === existing.id
            ? { ...it, qty: newQty, subtotal: it.pricePerUnit * newQty }
            : it,
        );
      }
      const newItem: OrderItem = {
        id: `rtl-item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        productVariantId: prod.variantId,
        productName: prod.name,
        dimension: "Pcs",
        qty: 1,
        finishing: "Siap Ambil",
        pricePerUnit: prod.price,
        uom: prod.uom,
        subtotal: prod.price,
        isProduction: false,
        categoryName: prod.categoryName,
      };
      return [...prev, newItem];
    });
  };

  const handleUpdateQty = (itemId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((it) => {
          if (it.id === itemId) {
            const newQty = Math.max(1, it.qty + delta);
            return { ...it, qty: newQty, subtotal: it.pricePerUnit * newQty };
          }
          return it;
        })
        .filter((it) => it.qty > 0),
    );
  };

  const handleRemoveItem = (itemId: string) => {
    setCartItems((prev) => prev.filter((it) => it.id !== itemId));
  };

  const totalBelanja = cartItems.reduce((sum, it) => sum + it.subtotal, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0 || isSubmitting) return;
    onCreateOrder(customerName, customerPhone, cartItems);
    setCustomerName("Customer Walk In");
    setCustomerPhone("");
    setCartItems([]);
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      className="rounded-3xl p-6 bg-card border border-border/50 text-foreground overflow-hidden max-h-[90vh] flex flex-col"
      showCloseButton={true}
    >
      <form onSubmit={handleSubmit} className="space-y-5 flex flex-col">
        {/* Header */}
        <div className="flex flex-col gap-1 border-b border-border/30 pb-4 pr-10">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 text-primary rounded-xl">
              <LuShoppingBag size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-foreground">
                Transaksi Ritel / Pisah Nota Baru
              </h2>
              <p className="text-xs text-muted-foreground font-semibold">
                Buat nota terpisah khusus produk non-produksi langsung di kasir.
              </p>
            </div>
          </div>
        </div>

        {/* Customer Information Form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">
              Nama Pelanggan <span className="text-rose-500">*</span>
            </label>
            <TextField
              placeholder="Contoh: Budi Santoso"
              prefixIcon={LuUser}
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">
              No. Handphone (Opsional)
            </label>
            <TextField
              placeholder="08xxxxxxxxxx"
              prefixIcon={LuPhone}
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
            />
          </div>
        </div>

        {/* Quick Product Selector */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-foreground block">
            Pilih Produk Cepat:
          </span>
          {isLoading ? (
            <div className="py-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <LuLoader size={16} className="animate-spin text-primary" />
              <span>Memuat produk ritel...</span>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-[140px] overflow-y-auto pr-1">
              {products.map((prod) => (
                <button
                  key={prod.id}
                  type="button"
                  onClick={() => handleAddItem(prod)}
                  className="p-2.5 rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/50 text-left transition-all active:scale-95 flex flex-col justify-between"
                >
                  <span className="text-[11px] font-bold text-foreground line-clamp-1 block">
                    {prod.name}
                  </span>
                  <span className="text-[10px] font-black text-primary mt-1 block">
                    {formatCurrency(prod.price)}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-muted-foreground font-semibold flex flex-col items-center gap-1">
              <LuPackage size={24} className="text-muted-foreground/60" />
              <span>Belum ada produk berkategori non-produksi.</span>
            </div>
          )}
        </div>

        {/* Selected Items Cart */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground">
              Keranjang Item Ritel ({cartItems.length}):
            </span>
            <span className="text-xs font-black text-primary">
              Total: {formatCurrency(totalBelanja)}
            </span>
          </div>

          <div className="max-h-[160px] overflow-y-auto border border-border/50 rounded-xl p-2 bg-muted/10 space-y-2">
            {cartItems.length > 0 ? (
              cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-2 p-2 rounded-lg bg-card border border-border/40 text-xs"
                >
                  <div className="flex-1 min-w-0">
                    <span className="font-bold text-foreground block truncate">
                      {item.productName}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {formatCurrency(item.pricePerUnit)} / pcs
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 bg-muted rounded-md p-0.5">
                    <button
                      type="button"
                      onClick={() => handleUpdateQty(item.id, -1)}
                      className="w-5 h-5 flex items-center justify-center rounded hover:bg-card text-foreground"
                    >
                      <LuMinus size={10} />
                    </button>
                    <span className="w-5 text-center font-mono font-bold text-xs">
                      {item.qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleUpdateQty(item.id, 1)}
                      className="w-5 h-5 flex items-center justify-center rounded hover:bg-card text-foreground"
                    >
                      <LuPlus size={10} />
                    </button>
                  </div>

                  <span className="font-bold text-foreground w-20 text-right">
                    {formatCurrency(item.subtotal)}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="p-1 rounded text-rose-500 hover:bg-rose-500/10 transition-colors"
                  >
                    <LuTrash2 size={13} />
                  </button>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-xs text-muted-foreground font-semibold">
                Belum ada produk yang dipilih. Klik salah satu produk di atas.
              </div>
            )}
          </div>
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
            type="submit"
            disabled={cartItems.length === 0 || isSubmitting}
            className="h-9 px-5 rounded-xl font-bold bg-primary text-primary-foreground shadow-md text-xs disabled:opacity-50"
          >
            {isSubmitting ? "Memproses..." : "Buat Nota Ritel"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

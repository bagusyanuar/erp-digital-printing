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
  LuSearch,
  LuX,
  LuCheck,
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
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
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

  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.categoryName));
    return ["ALL", ...Array.from(cats)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchSearch =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.categoryName.toLowerCase().includes(search.toLowerCase());
      const matchCat =
        selectedCategory === "ALL" || product.categoryName === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [products, search, selectedCategory]);

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

  const totalQty = useMemo(() => {
    return cartItems.reduce((sum, it) => sum + it.qty, 0);
  }, [cartItems]);

  const totalBelanja = useMemo(() => {
    return cartItems.reduce((sum, it) => sum + it.subtotal, 0);
  }, [cartItems]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0 || isSubmitting) return;
    onCreateOrder(customerName, customerPhone, cartItems);
    setCustomerName("Customer Walk In");
    setCustomerPhone("");
    setSearch("");
    setCartItems([]);
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      className="max-w-5xl w-full p-0 rounded-3xl bg-card border border-border/60 text-foreground overflow-hidden max-h-[92vh] flex flex-col shadow-2xl"
      showCloseButton={true}
    >
      <form onSubmit={handleSubmit} className="flex flex-col h-full min-h-0">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-muted/10 pr-14 shrink-0">
          <div className="p-2.5 bg-primary/10 text-primary rounded-2xl">
            <LuShoppingBag size={22} />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight text-foreground">
              Transaksi Ritel / Pisah Nota Baru
            </h2>
            <p className="text-xs text-muted-foreground font-semibold">
              Buat nota terpisah khusus produk non-produksi langsung di kasir
            </p>
          </div>
        </div>

        {/* 2-Panel Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-border/40 flex-1 min-h-0 overflow-hidden">
          {/* LEFT PANEL: Form Pelanggan + Katalog Produk (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col p-6 space-y-5 overflow-y-auto min-h-0 scrollbar-thin">
            {/* Customer Information Form */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Data Pelanggan
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-0.5">
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
                    className="focus-visible:ring-offset-0 focus-visible:ring-2 focus-visible:ring-primary"
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
                    className="focus-visible:ring-offset-0 focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>
              </div>
            </div>

            {/* Product Catalog Section */}
            <div className="space-y-3 flex-1 flex flex-col min-h-0 pt-2 border-t border-border/30">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Pilih Produk Ritel
                </span>
                <span className="text-xs text-muted-foreground font-medium">
                  {filteredProducts.length} produk tersedia
                </span>
              </div>

              {/* Search & Category Filter */}
              <div className="space-y-2 p-0.5">
                <div className="relative">
                  <TextField
                    placeholder="Cari nama produk (contoh: Aqua, Lakban, Map)..."
                    prefixIcon={LuSearch}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="focus-visible:ring-offset-0 focus-visible:ring-2 focus-visible:ring-primary"
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                    >
                      <LuX size={14} />
                    </button>
                  )}
                </div>

                {categories.length > 2 && (
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all shrink-0 ${
                          selectedCategory === cat
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
                        }`}
                      >
                        {cat === "ALL" ? "Semua Kategori" : cat}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Grid */}
              <div className="flex-1 min-h-[220px] max-h-[340px] overflow-y-auto pr-1 scrollbar-thin p-0.5">
                {isLoading ? (
                  <div className="h-44 flex flex-col items-center justify-center text-center space-y-2 text-muted-foreground">
                    <LuLoader size={24} className="animate-spin text-primary" />
                    <span className="text-xs font-semibold">
                      Memuat katalog produk...
                    </span>
                  </div>
                ) : filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {filteredProducts.map((prod) => {
                      const cartItem = cartItems.find(
                        (it) => it.productVariantId === prod.variantId,
                      );
                      const inCartQty = cartItem ? cartItem.qty : 0;

                      return (
                        <button
                          key={prod.id}
                          type="button"
                          onClick={() => handleAddItem(prod)}
                          className={`p-3 rounded-2xl border text-left transition-all active:scale-95 flex flex-col justify-between gap-2.5 relative group ${
                            inCartQty > 0
                              ? "border-primary/50 bg-primary/5 shadow-sm"
                              : "border-border/60 bg-muted/20 hover:bg-muted/50 hover:border-border"
                          }`}
                        >
                          {inCartQty > 0 && (
                            <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-black shadow-xs">
                              {inCartQty}x
                            </div>
                          )}
                          <div className="space-y-1 pr-5">
                            <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block line-clamp-1">
                              {prod.categoryName}
                            </span>
                            <span className="text-xs font-bold text-foreground line-clamp-2 block leading-tight">
                              {prod.name}
                            </span>
                          </div>

                          <div className="flex items-center justify-between pt-1 border-t border-border/20 w-full mt-auto">
                            <span className="text-xs font-black text-primary font-mono">
                              {formatCurrency(prod.price)}
                            </span>
                            <span className="p-1 rounded-lg bg-background text-foreground/80 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                              <LuPlus size={12} />
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="h-44 flex flex-col items-center justify-center text-center space-y-2 text-muted-foreground">
                    <LuPackage size={32} className="text-muted-foreground/50" />
                    <p className="text-xs font-bold">
                      Tidak ada produk ritel yang ditemukan.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: Keranjang Belanja + Ringkasan + Aksi (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col bg-muted/15 p-6 min-h-0 justify-between">
            {/* Cart Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border/40 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-foreground">
                  Keranjang Belanja
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-primary/10 text-primary">
                  {cartItems.length} Item
                </span>
              </div>
              {cartItems.length > 0 && (
                <button
                  type="button"
                  onClick={() => setCartItems([])}
                  className="text-[11px] font-bold text-rose-500 hover:text-rose-600 transition-colors"
                >
                  Kosongkan
                </button>
              )}
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto space-y-2 py-3 pr-1 min-h-[220px] max-h-[380px] scrollbar-thin">
              {cartItems.length > 0 ? (
                cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl bg-card border border-border/50 text-xs shadow-xs flex flex-col gap-2 hover:border-border transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <span className="font-bold text-foreground block truncate">
                          {item.productName}
                        </span>
                        <span className="text-[10px] font-medium text-muted-foreground">
                          {formatCurrency(item.pricePerUnit)} / {item.uom || "pcs"}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-1 rounded-md text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors shrink-0"
                        title="Hapus Item"
                      >
                        <LuTrash2 size={13} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-border/20">
                      <div className="flex items-center gap-1.5 bg-muted/60 rounded-lg p-0.5">
                        <button
                          type="button"
                          onClick={() => handleUpdateQty(item.id, -1)}
                          className="w-5 h-5 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-card active:scale-95 transition-all"
                        >
                          <LuMinus size={11} />
                        </button>
                        <span className="w-6 text-center font-mono font-bold text-xs text-foreground">
                          {item.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateQty(item.id, 1)}
                          className="w-5 h-5 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-card active:scale-95 transition-all"
                        >
                          <LuPlus size={11} />
                        </button>
                      </div>

                      <span className="font-mono font-black text-foreground">
                        {formatCurrency(item.subtotal)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-center p-6 space-y-2 border-2 border-dashed border-border/40 rounded-2xl bg-muted/10">
                  <div className="p-3 bg-muted/40 rounded-full text-muted-foreground/60">
                    <LuShoppingBag size={28} />
                  </div>
                  <p className="text-xs font-bold text-foreground">
                    Keranjang Masih Kosong
                  </p>
                  <p className="text-[11px] text-muted-foreground max-w-[200px]">
                    Pilih produk dari panel sebelah kiri untuk menambahkan ke
                    keranjang.
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Summary & Actions */}
            <div className="border-t border-border/40 pt-4 space-y-4 shrink-0 mt-auto">
              <div className="space-y-1.5 bg-card/60 p-3.5 rounded-2xl border border-border/40">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Total Kuantitas</span>
                  <span className="font-bold font-mono text-foreground">
                    {totalQty} pcs
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-border/20">
                  <span className="text-xs font-bold text-foreground">
                    Total Tagihan
                  </span>
                  <span className="text-base font-black text-primary font-mono">
                    {formatCurrency(totalBelanja)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 h-10 rounded-xl font-bold border-border/60 hover:bg-muted text-xs"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={cartItems.length === 0 || isSubmitting}
                  className="flex-2 h-10 rounded-xl font-bold bg-primary text-primary-foreground shadow-md text-xs disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <LuLoader size={14} className="animate-spin" />
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <>
                      <LuCheck size={14} />
                      <span>Buat Nota Ritel</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </Dialog>
  );
};

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog } from "@erp-digital-printing/ui/Dialog";
import { Button } from "@erp-digital-printing/ui/Button";
import { TextField } from "@erp-digital-printing/ui/TextField";
import {
  LuSearch,
  LuShoppingBag,
  LuPlus,
  LuCheck,
  LuMinus,
  LuPackage,
  LuLoader,
} from "@erp-digital-printing/ui/icons";
import { useProductDI } from "../../product/hooks/useProductDI";
import { productKeys } from "@infrastructure/product/keys";
import type { RetailProductItem } from "../types/retail.type";

interface AddRetailItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  targetTicketNo: string;
  onAddItem: (product: RetailProductItem, qty: number) => void;
}

const formatCurrency = (val: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(val);
};

export const AddRetailItemDialog: React.FC<AddRetailItemDialogProps> = ({
  isOpen,
  onClose,
  targetTicketNo,
  onAddItem,
}) => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

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

  const handleQtyChange = (productId: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[productId] || 1;
      const next = Math.max(1, current + delta);
      return { ...prev, [productId]: next };
    });
  };

  const handleAdd = (product: RetailProductItem) => {
    const qty = quantities[product.id] || 1;
    onAddItem(product, qty);
    setAddedIds((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [product.id]: false }));
    }, 1500);
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      className="rounded-3xl p-6 bg-card border border-border/50 text-foreground overflow-hidden max-h-[90vh] flex flex-col"
      showCloseButton={true}
    >
      <div className="space-y-5 flex flex-col">
        {/* Header */}
        <div className="flex flex-col gap-1 border-b border-border/30 pb-4 pr-10">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
              <LuShoppingBag size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-foreground">
                Tambah Item Ritel (Gabung ke Tiket)
              </h2>
              <p className="text-xs text-muted-foreground font-semibold">
                Item non-produksi akan digabungkan ke nota tiket:{" "}
                <span className="font-mono font-bold text-foreground">
                  {targetTicketNo}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Search & Category Filter */}
        <div className="space-y-3">
          <div className="p-0.5">
            <TextField
              placeholder="Cari nama produk ritel..."
              prefixIcon={LuSearch}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full focus-visible:ring-offset-0 focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>

          {categories.length > 1 && (
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

        {/* Product Catalog Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-1 scrollbar-thin">
          {isLoading ? (
            <div className="col-span-2 py-12 flex flex-col items-center justify-center text-center space-y-2">
              <LuLoader size={28} className="animate-spin text-primary" />
              <p className="text-xs font-bold text-muted-foreground">
                Memuat katalog produk ritel...
              </p>
            </div>
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map((product) => {
              const qty = quantities[product.id] || 1;
              const isJustAdded = addedIds[product.id];
              return (
                <div
                  key={product.id}
                  className="p-3.5 rounded-2xl border border-border/60 bg-muted/20 hover:bg-muted/40 transition-colors flex flex-col justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        {product.categoryName}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-foreground line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-xs font-black text-primary">
                      {formatCurrency(product.price)} / {product.uom}
                    </p>
                  </div>

                  {/* Quantity & Add Action */}
                  <div className="flex items-center justify-between pt-2 border-t border-border/20">
                    <div className="flex items-center gap-1.5 bg-background border border-border/60 rounded-lg p-0.5">
                      <button
                        type="button"
                        onClick={() => handleQtyChange(product.id, -1)}
                        className="w-6 h-6 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted active:scale-95 transition-all"
                      >
                        <LuMinus size={12} />
                      </button>
                      <span className="w-7 text-center font-mono font-bold text-xs text-foreground">
                        {qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleQtyChange(product.id, 1)}
                        className="w-6 h-6 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted active:scale-95 transition-all"
                      >
                        <LuPlus size={12} />
                      </button>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => handleAdd(product)}
                      className={`h-7 px-3 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                        isJustAdded
                          ? "bg-emerald-600 text-white"
                          : "bg-primary text-primary-foreground"
                      }`}
                    >
                      {isJustAdded ? (
                        <>
                          <LuCheck size={13} />
                          Ditambahkan
                        </>
                      ) : (
                        <>
                          <LuPlus size={13} />
                          Gabung
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-2 py-10 flex flex-col items-center justify-center text-center space-y-2">
              <LuPackage size={32} className="text-muted-foreground/60" />
              <p className="text-xs font-bold text-muted-foreground">
                Tidak ada produk ritel yang cocok dengan pencarian.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-border/30 pt-4 mt-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="h-9 px-5 rounded-xl font-bold border-border/60 hover:bg-muted text-xs"
          >
            Selesai
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

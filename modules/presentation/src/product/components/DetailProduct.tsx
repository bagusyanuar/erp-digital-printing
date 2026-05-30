import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useProductDI } from "../hooks/useProductDI";
import { productKeys } from "@infrastructure/product/keys";
import { Button } from "@erp-digital-printing/ui/Button";
import { Typography } from "@erp-digital-printing/ui/Typography";
import {
  LuX,
  LuBox,
  LuTags,
  LuFileText,
  LuUsers,
  LuUser,
  LuDatabase,
  LuInfo,
} from "@erp-digital-printing/ui/icons";

interface DetailProductProps {
  productId: string;
  onClose: () => void;
}

const DetailProduct: React.FC<DetailProductProps> = ({
  productId,
  onClose,
}) => {
  const { getProductByIdUseCase } = useProductDI();

  const {
    data: product,
    isLoading,
    error,
  } = useQuery({
    queryKey: productKeys.detail(productId),
    queryFn: () => getProductByIdUseCase.execute(productId),
    staleTime: 10_000,
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <div className="h-[75vh] flex flex-col items-center justify-center p-6 bg-background text-foreground font-sans">
        <div className="flex flex-col items-center gap-4">
          {/* Custom Sleek Spinner */}
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
          <div className="text-center space-y-1">
            <Typography variant="p" weight="bold" className="text-foreground">
              Memuat Detail Produk...
            </Typography>
            <Typography variant="small" className="text-muted-foreground">
              Mengambil informasi dan tiering harga dari server backend.
            </Typography>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="h-[75vh] flex flex-col items-center justify-center p-6 bg-background text-foreground font-sans text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
          <LuInfo size={24} />
        </div>
        <div className="space-y-1 max-w-sm">
          <Typography variant="p" weight="bold" className="text-foreground">
            Gagal Memuat Produk
          </Typography>
          <Typography variant="small" className="text-muted-foreground">
            {error instanceof Error
              ? error.message
              : "Terjadi kesalahan yang tidak diketahui."}
          </Typography>
        </div>
        <Button
          onClick={onClose}
          variant="outline"
          className="rounded-xl font-bold px-5 active:scale-95 transition-all"
        >
          Tutup
        </Button>
      </div>
    );
  }

  const groupPriceTiers = (
    tiers: Array<{
      id?: string;
      customer_level_id: string;
      min_qty: number;
      max_qty: number;
      price_per_unit: number;
    }> = [],
  ) => {
    const RESELLER_LEVEL_ID = "d2c67ef8-82e4-4d8b-968b-5a1e2f5b6154";
    const reseller = tiers.filter(
      (t) => t.customer_level_id === RESELLER_LEVEL_ID,
    );
    const endUser = tiers.filter(
      (t) => t.customer_level_id !== RESELLER_LEVEL_ID,
    );
    return { reseller, endUser };
  };

  const formatUOM = (uom: string) => {
    switch (uom) {
      case "m2":
        return "Meter Persegi (m²)";
      case "pcs":
        return "PCS (pcs)";
      case "m_lari":
        return "Meter Lari (m_lari)";
      case "box":
        return "Box (box)";
      default:
        return uom;
    }
  };

  return (
    <div className="h-[90vh] flex flex-col font-sans w-full bg-background text-foreground overflow-hidden">
      {/* 1. Header */}
      <div className="p-6 pb-5 border-b border-border/30 bg-card flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-sm">
            {product.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-foreground">
              Detail Informasi Produk
            </h1>
            <p className="text-muted-foreground font-semibold text-xs mt-0.5">
              Lihat konfigurasi SKU, uom, varian atribut, dan tiering harga
              grosir.
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-xl hover:bg-muted border-border/50 active:scale-95 transition-all"
          onClick={onClose}
        >
          <LuX size={18} className="text-muted-foreground" />
        </Button>
      </div>

      {/* 2. Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Product Basic Info Card */}
        <div className="border border-border/40 bg-card rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-border/30 pb-3">
            <LuBox className="text-primary" size={20} />
            <h2 className="text-sm font-black text-foreground uppercase tracking-wider">
              Informasi Dasar Produk
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Nama Produk / Bahan
              </span>
              <p className="text-sm font-bold text-foreground">
                {product.name}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Nomor SKU
              </span>
              <p className="text-sm font-black text-primary bg-primary/5 px-2 py-0.5 rounded-lg border border-primary/10 inline-block">
                {product.sku}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Satuan Hitung (UoM)
              </span>
              <p className="text-sm font-bold text-foreground">
                {formatUOM(product.uom)}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Harga Dasar Referensi
              </span>
              <p className="text-sm font-bold text-foreground">
                Rp {product.base_price?.toLocaleString("id-ID") ?? 0}
              </p>
            </div>
          </div>

          {product.description && (
            <div className="space-y-1 pt-2 border-t border-border/20">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Deskripsi Jasa / Produk
              </span>
              <p className="text-xs text-foreground/80 font-medium leading-relaxed">
                {product.description}
              </p>
            </div>
          )}
        </div>

        {/* Variants Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <LuTags className="text-primary" size={20} />
            <h2 className="text-sm font-black text-foreground uppercase tracking-wider">
              Daftar Variasi & Matriks Harga Bertingkat
            </h2>
          </div>

          {!product.variants || product.variants.length === 0 ? (
            <div className="border border-dashed border-border/50 rounded-2xl p-8 text-center bg-card text-muted-foreground text-xs font-semibold">
              Produk ini tidak memiliki konfigurasi variasi atribut harga.
            </div>
          ) : (
            <div className="space-y-6">
              {product.variants.map((v, i) => {
                const { reseller, endUser } = groupPriceTiers(v.price_tiers);

                return (
                  <div
                    key={v.id || i}
                    className="border border-border/40 bg-card rounded-2xl p-5 shadow-sm space-y-4 hover:border-primary/20 transition-all duration-300"
                  >
                    {/* Variant Card Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border/30">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-xs">
                          {v.variant_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-xs font-black text-foreground">
                            Varian: {v.variant_name}
                          </h3>
                          <p className="text-[9px] text-muted-foreground font-semibold">
                            Biaya Tambahan Varian: Rp{" "}
                            {v.additional_cost?.toLocaleString("id-ID") ?? 0}
                          </p>
                        </div>
                      </div>

                      {/* Display active attribute keys/values */}
                      {v.attributes && v.attributes.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {v.attributes.map((attr, idx) => (
                            <span
                              key={idx}
                              className="text-[9px] font-bold text-primary bg-primary/5 border border-primary/20 px-2 py-0.5 rounded-full"
                            >
                              Nilai Atribut: {attr.value}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Side-by-Side 2 Price Tiers */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                      {/* Reseller Pricing Column */}
                      <div className="space-y-3 bg-muted/10 border border-border/30 rounded-xl p-4 flex flex-col justify-between">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-primary border-b border-border/30 pb-2">
                            <LuUsers size={14} />
                            <h4 className="text-[10px] font-black tracking-wide uppercase">
                              Tier Harga Reseller
                            </h4>
                          </div>

                          {reseller.length === 0 ? (
                            <p className="text-[10px] text-muted-foreground italic text-center py-4">
                              Belum ada tier harga
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {reseller.map((tier, idx) => (
                                <div
                                  key={tier.id || idx}
                                  className="flex items-center justify-between bg-background px-3 py-2 rounded-lg border border-border/40 shadow-sm text-xs font-bold"
                                >
                                  <span className="text-muted-foreground">
                                    Qty {tier.min_qty} -{" "}
                                    {tier.max_qty >= 999999
                                      ? "∞"
                                      : tier.max_qty}
                                  </span>
                                  <span className="text-primary font-black">
                                    Rp{" "}
                                    {tier.price_per_unit.toLocaleString(
                                      "id-ID",
                                    )}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* End User Pricing Column */}
                      <div className="space-y-3 bg-muted/10 border border-border/30 rounded-xl p-4 flex flex-col justify-between">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-primary border-b border-border/30 pb-2">
                            <LuUser size={14} />
                            <h4 className="text-[10px] font-black tracking-wide uppercase">
                              Tier Harga End User
                            </h4>
                          </div>

                          {endUser.length === 0 ? (
                            <p className="text-[10px] text-muted-foreground italic text-center py-4">
                              Belum ada tier harga
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {endUser.map((tier, idx) => (
                                <div
                                  key={tier.id || idx}
                                  className="flex items-center justify-between bg-background px-3 py-2 rounded-lg border border-border/40 shadow-sm text-xs font-bold"
                                >
                                  <span className="text-muted-foreground">
                                    Qty {tier.min_qty} -{" "}
                                    {tier.max_qty >= 999999
                                      ? "∞"
                                      : tier.max_qty}
                                  </span>
                                  <span className="text-primary font-black">
                                    Rp{" "}
                                    {tier.price_per_unit.toLocaleString(
                                      "id-ID",
                                    )}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 3. Sticky Footer */}
      <div className="p-6 border-t border-border/30 bg-muted/10 shrink-0 flex items-center justify-end">
        <Button
          variant="outline"
          className="h-10 px-5 rounded-xl font-bold border-border/50 hover:bg-muted/50 active:scale-95 transition-all"
          onClick={onClose}
        >
          Tutup Detail
        </Button>
      </div>
    </div>
  );
};

export default DetailProduct;

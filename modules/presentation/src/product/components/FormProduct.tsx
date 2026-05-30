import React, { useState } from "react";
import { Button } from "@erp-digital-printing/ui/Button";
import { TextField } from "@erp-digital-printing/ui/TextField";
import { Typography } from "@erp-digital-printing/ui/Typography";
import {
  LuArrowLeft,
  LuFileText,
  LuSlidersHorizontal,
  LuTags,
  LuChevronRight,
  LuChevronLeft,
  LuBox,
  LuTrash2,
  LuPlus,
  LuUsers,
  LuUser,
} from "@erp-digital-printing/ui/icons";
import { useForm } from "react-hook-form";
import { toast } from "@erp-digital-printing/ui/Toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCategoryDI } from "@presentation/category/hooks/useCategoryDI";
import { categoryKeys } from "@infrastructure/category/keys";
import { useAttributeDI } from "@presentation/attribute/hooks/useAttributeDI";
import { attributeKeys } from "@infrastructure/attribute/keys";
import { useProductDI } from "../hooks/useProductDI";
import { productKeys } from "@infrastructure/product/keys";
import type { ProductModel } from "@core/product/domains/models/product.model";

interface FormProductProps {
  onBack: () => void;
}

interface Step1Inputs {
  name: string;
  category: string;
  uom: "m2" | "pcs" | "m_lari" | "box";
  description: string;
}

interface VariantOption {
  id: string;
  name: string;
}

interface VariantGroup {
  id: string;
  name: string;
  unit?: string;
  inputValue?: string;
  options: VariantOption[];
}

interface PriceTier {
  id: string;
  minQty: number;
  maxQty: number;
  price: number;
}

const FormProduct: React.FC<FormProductProps> = ({ onBack }) => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [hasVariants, setHasVariants] = useState<boolean>(true);
  const [selectedAttributeId, setSelectedAttributeId] = useState<string>("");
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [variantPrices, setVariantPrices] = useState<
    Record<
      string,
      {
        reseller: PriceTier[];
        endUser: PriceTier[];
      }
    >
  >({});
  const [variantGroups, setVariantGroups] = useState<VariantGroup[]>([
    {
      id: "vg-1",
      name: "Bahan / Model",
      unit: "-",
      inputValue: "",
      options: [
        { id: "opt-1", name: "HVS" },
        { id: "opt-2", name: "AP 120" },
        { id: "opt-3", name: "Stiker Vinyl" },
      ],
    },
    {
      id: "vg-2",
      name: "Sisi Cetak",
      unit: "sisi",
      inputValue: "",
      options: [
        { id: "opt-4", name: "1 Sisi" },
        { id: "opt-5", name: "2 Sisi" },
      ],
    },
  ]);

  const { getCategoriesUseCase } = useCategoryDI();
  const { getAttributesUseCase } = useAttributeDI();
  const { createProductUseCase } = useProductDI();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (input: ProductModel) => createProductUseCase.execute(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      toast.success(
        "Produk Berhasil Dibuat",
        "Produk baru telah berhasil disimpan.",
      );
      onBack();
    },
    onError: (err: Error) => {
      toast.error("Gagal Membuat Produk", err.message || "Terjadi kesalahan.");
    },
  });

  // Fetch categories dynamically from backend DI
  const { data: categoryResponse, isLoading: isLoadingCategories } = useQuery({
    queryKey: categoryKeys.list({ limit: 100, page: 1 }),
    queryFn: () => getCategoriesUseCase.execute({ limit: 100, page: 1 }),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  // Fetch attributes dynamically from backend DI
  const { data: attributeResponse, isLoading: isLoadingAttributes } = useQuery({
    queryKey: attributeKeys.list({ limit: 100, page: 1 }),
    queryFn: () => getAttributesUseCase.execute({ limit: 100, page: 1 }),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  const categories = categoryResponse?.data ?? [];
  const attributes = attributeResponse?.data ?? [];

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<Step1Inputs>({
    defaultValues: {
      name: "",
      category: "",
      uom: "m2",
      description: "",
    },
  });

  const handleNextStep1 = handleSubmit((data) => {
    setActiveStep(2);
    toast.success(
      "Step 1 Valid!",
      "Informasi dasar produk telah terisi dengan benar.",
    );
  });

  return (
    <div className="h-[90vh] flex flex-col font-sans w-full bg-background text-foreground overflow-hidden">
      {/* 1. STICKY HEADER (Title, Back Button & Stepper Progress) */}
      <div className="p-6 pb-5 border-b border-border/30 bg-card space-y-6 shrink-0">
        {/* Header Navigation */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-xl hover:bg-muted border-border/50 active:scale-95 transition-all"
            onClick={onBack}
            type="button"
          >
            <LuArrowLeft size={20} className="text-muted-foreground" />
          </Button>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-foreground">
              Tambah Produk Baru
            </h1>
            <p className="text-muted-foreground font-semibold text-xs mt-0.5">
              Buat produk baru dengan sistem varian dan harga grosir bertingkat.
            </p>
          </div>
        </div>

        {/* Stepper Progress Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border border-border/30 rounded-2xl p-4 bg-muted/20">
          {/* Step 1 Indicator */}
          <div className="flex items-center gap-3 flex-1">
            <div
              className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold border transition-all ${
                activeStep === 1
                  ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105"
                  : activeStep > 1
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                    : "bg-muted border-border/50 text-muted-foreground"
              }`}
            >
              <LuFileText size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                Langkah 1
              </span>
              <span className="text-xs font-black text-foreground mt-1">
                Informasi Produk
              </span>
            </div>
          </div>

          {/* Line separator 1 */}
          <div className="hidden md:block h-[1px] bg-border/80 flex-1 mx-2 max-w-[60px]" />

          {/* Step 2 Indicator */}
          <div className="flex items-center gap-3 flex-1 opacity-80">
            <div
              className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold border transition-all ${
                activeStep === 2
                  ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105"
                  : "bg-muted border-border/50 text-muted-foreground"
              }`}
            >
              <LuSlidersHorizontal size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                Langkah 2
              </span>
              <span className="text-xs font-black text-foreground mt-1">
                Konfigurasi Varian
              </span>
            </div>
          </div>

          {/* Line separator 2 */}
          <div className="hidden md:block h-[1px] bg-border/80 flex-1 mx-2 max-w-[60px]" />

          {/* Step 3 Indicator */}
          <div className="flex items-center gap-3 flex-1 opacity-80">
            <div
              className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold border transition-all ${
                activeStep === 3
                  ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105"
                  : "bg-muted border-border/50 text-muted-foreground"
              }`}
            >
              <LuTags size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                Langkah 3
              </span>
              <span className="text-xs font-black text-foreground mt-1">
                Harga & Tiering
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SCROLLABLE FORM BODY & STICKY FOOTER */}

      {/* STEP 1: INFORMASI PRODUK */}
      {activeStep === 1 && (
        <form
          onSubmit={handleNextStep1}
          className="flex-1 flex flex-col overflow-hidden"
        >
          {/* Scrollable Container */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="space-y-1">
              <h2 className="text-lg font-black text-foreground flex items-center gap-2">
                <LuBox className="text-primary" size={22} />
                Detail Informasi Produk Dasar
              </h2>
              <p className="text-xs text-muted-foreground font-semibold">
                Masukkan detail nama produk, kategori payung besar, satuan
                hitung dasar (UoM), serta deskripsi.
              </p>
            </div>

            {isLoadingCategories ? (
              <div className="space-y-5 animate-pulse pt-2">
                {/* Skeleton Nama Produk */}
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded-md w-1/4" />
                  <div className="h-10 bg-muted rounded-xl w-full" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Skeleton Kategori */}
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded-md w-1/3" />
                    <div className="h-10 bg-muted rounded-xl w-full" />
                  </div>
                  {/* Skeleton Satuan */}
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded-md w-1/3" />
                    <div className="h-10 bg-muted rounded-xl w-full" />
                  </div>
                </div>

                {/* Skeleton Deskripsi */}
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded-md w-1/4" />
                  <div className="h-28 bg-muted rounded-xl w-full" />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                {/* Nama Produk */}
                <div className="space-y-1.5 md:col-span-2">
                  <Typography
                    variant="small"
                    weight="bold"
                    className="text-xs text-foreground/80"
                  >
                    Nama Produk / Bahan <span className="text-rose-500">*</span>
                  </Typography>
                  <TextField
                    placeholder="Contoh: Flexi Banner 280g, Art Paper 150g, dll"
                    className="border-border/50 focus:bg-background transition-all h-10"
                    {...register("name", {
                      required: "Nama produk wajib diisi",
                    })}
                  />
                  {errors.name && (
                    <p className="text-[11px] text-rose-500 font-bold mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Kategori Produk */}
                <div className="space-y-1.5">
                  <Typography
                    variant="small"
                    weight="bold"
                    className="text-xs text-foreground/80"
                  >
                    Kategori <span className="text-rose-500">*</span>
                  </Typography>
                  <select
                    className="w-full border border-border/50 rounded-xl px-3 py-2 text-sm bg-card hover:bg-muted/30 focus:bg-background h-10 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-semibold"
                    disabled={isLoadingCategories}
                    {...register("category", {
                      required: "Kategori wajib dipilih",
                    })}
                  >
                    <option value="">
                      {isLoadingCategories
                        ? "Memuat Kategori..."
                        : "-- Pilih Kategori --"}
                    </option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="text-[11px] text-rose-500 font-bold mt-1">
                      {errors.category.message}
                    </p>
                  )}
                </div>

                {/* Satuan UoM */}
                <div className="space-y-1.5">
                  <Typography
                    variant="small"
                    weight="bold"
                    className="text-xs text-foreground/80"
                  >
                    Satuan Hitung (UoM) <span className="text-rose-500">*</span>
                  </Typography>
                  <select
                    className="w-full border border-border/50 rounded-xl px-3 py-2 text-sm bg-card hover:bg-muted/30 focus:bg-background h-10 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-semibold"
                    {...register("uom", { required: "Satuan wajib dipilih" })}
                  >
                    <option value="m2">Meter Persegi (m2)</option>
                    <option value="pcs">PCS (pcs)</option>
                    <option value="m_lari">Meter Lari (m_lari)</option>
                    <option value="box">Box (box)</option>
                  </select>
                  {errors.uom && (
                    <p className="text-[11px] text-rose-500 font-bold mt-1">
                      {errors.uom.message}
                    </p>
                  )}
                </div>

                {/* Deskripsi */}
                <div className="space-y-1.5 md:col-span-2">
                  <Typography
                    variant="small"
                    weight="bold"
                    className="text-xs text-foreground/80"
                  >
                    Deskripsi
                  </Typography>
                  <textarea
                    rows={4}
                    placeholder="Masukkan deskripsi singkat produk cetak..."
                    className="w-full border border-border/50 rounded-xl p-3 text-sm bg-card hover:bg-muted/30 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-semibold resize-none"
                    {...register("description")}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Sticky Footer */}
          <div className="p-6 border-t border-border/30 bg-muted/10 shrink-0 flex items-center justify-between">
            <Button
              variant="outline"
              type="button"
              className="h-10 px-5 rounded-xl font-bold border-border/50 hover:bg-muted/50 active:scale-95 transition-all"
              onClick={onBack}
            >
              Batal
            </Button>
            <Button
              className="h-10 px-5 rounded-xl font-bold bg-primary hover:bg-primary/95 text-white active:scale-95 transition-all flex items-center gap-2"
              type="submit"
            >
              Selanjutnya
              <LuChevronRight size={18} />
            </Button>
          </div>
        </form>
      )}

      {/* STEP 2: KONFIGURASI VARIAN */}
      {activeStep === 2 && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Scrollable Container */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="space-y-1">
              <h2 className="text-lg font-black text-foreground flex items-center gap-2">
                <LuSlidersHorizontal className="text-primary" size={22} />
                Pilih Atribut Varian
              </h2>
              <p className="text-xs text-muted-foreground font-semibold">
                Pilih atribut dari master data untuk dikonfigurasi sebagai
                varian produk ini (contoh: Bahan, Sisi Cetak, Ukuran).
              </p>
            </div>

            {/* Toggle has variant or not */}
            <div className="flex items-center justify-between border border-border/40 bg-card rounded-2xl p-5 shadow-sm">
              <div className="space-y-1">
                <Typography
                  variant="small"
                  weight="bold"
                  className="text-sm text-foreground"
                >
                  Produk memiliki variasi (Varian)?
                </Typography>
                <p className="text-[11px] text-muted-foreground font-semibold">
                  Aktifkan jika produk memiliki opsi variasi (seperti: 1 Sisi/2
                  Sisi). Matikan jika produk bersifat standar (tanpa varian).
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const target = !hasVariants;
                  setHasVariants(target);
                  if (!target) {
                    setSelectedAttributeId("");
                    setSelectedOptions(["Default"]);
                    setVariantPrices({
                      Default: {
                        reseller: [
                          {
                            id: `res-${Date.now()}-${Math.random()}`,
                            minQty: 1,
                            maxQty: 999999,
                            price: 0,
                          },
                        ],
                        endUser: [
                          {
                            id: `end-${Date.now()}-${Math.random()}`,
                            minQty: 1,
                            maxQty: 999999,
                            price: 0,
                          },
                        ],
                      },
                    });
                  } else {
                    setSelectedAttributeId("");
                    setSelectedOptions([]);
                    setVariantPrices({});
                  }
                }}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  hasVariants ? "bg-primary" : "bg-muted-foreground/30"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow-lg ring-0 transition duration-200 ease-in-out ${
                    hasVariants ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {hasVariants ? (
              /* Dropdown Card */
              <div className="border border-border/40 bg-card rounded-2xl p-6 shadow-sm w-full space-y-5">
                <div className="space-y-2">
                  <Typography
                    variant="small"
                    weight="bold"
                    className="text-xs text-foreground/80"
                  >
                    Pilih Atribut <span className="text-rose-500">*</span>
                  </Typography>
                  <select
                    value={selectedAttributeId}
                    onChange={(e) => {
                      setSelectedAttributeId(e.target.value);
                      setSelectedOptions([]); // Start unselected all
                      setVariantPrices({}); // Reset pricing tiers
                    }}
                    className="w-full border border-border/50 rounded-xl px-3 py-2.5 text-sm bg-card hover:bg-muted/30 focus:bg-background h-11 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-semibold"
                    disabled={isLoadingAttributes}
                  >
                    <option value="">
                      {isLoadingAttributes
                        ? "Memuat Atribut..."
                        : "-- Pilih Atribut --"}
                    </option>
                    {attributes.map((attr) => (
                      <option key={attr.id} value={attr.id}>
                        {attr.name} ({attr.options?.length ?? 0} opsi)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Show selected attribute options just as preview */}
                {selectedAttributeId &&
                  (() => {
                    const attr = attributes.find(
                      (a) => a.id === selectedAttributeId,
                    );
                    if (!attr) return null;
                    return (
                      <div className="bg-muted/30 border border-border/30 rounded-xl p-5 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <h4 className="text-xs font-black text-foreground">
                              Opsi Nilai untuk {attr.name}:
                            </h4>
                            <p className="text-[10px] text-muted-foreground font-semibold">
                              Klik opsi untuk mengaktifkan atau menonaktifkannya
                              pada produk ini.
                            </p>
                          </div>
                          <span className="text-[10px] font-black text-primary/80 bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full self-start sm:self-center">
                            {selectedOptions.length} terpilih
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2.5 pt-1">
                          {attr.options && attr.options.length > 0 ? (
                            attr.options.map((opt, i) => {
                              const isSelected = selectedOptions.includes(opt);
                              return (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() => {
                                    if (isSelected) {
                                      setSelectedOptions(
                                        selectedOptions.filter(
                                          (o) => o !== opt,
                                        ),
                                      );
                                      setVariantPrices((prev) => {
                                        const updated = { ...prev };
                                        delete updated[opt];
                                        return updated;
                                      });
                                    } else {
                                      setSelectedOptions([
                                        ...selectedOptions,
                                        opt,
                                      ]);
                                      setVariantPrices((prev) => ({
                                        ...prev,
                                        [opt]: {
                                          reseller: [
                                            {
                                              id: `res-${Date.now()}-${Math.random()}`,
                                              minQty: 1,
                                              maxQty: 999999,
                                              price: 0,
                                            },
                                          ],
                                          endUser: [
                                            {
                                              id: `end-${Date.now()}-${Math.random()}`,
                                              minQty: 1,
                                              maxQty: 999999,
                                              price: 0,
                                            },
                                          ],
                                        },
                                      }));
                                    }
                                  }}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all duration-200 active:scale-95 flex items-center gap-1.5 shadow-sm ${
                                    isSelected
                                      ? "bg-primary/25 text-primary border-primary hover:bg-primary/30"
                                      : "bg-muted/50 text-muted-foreground border-border/80 hover:bg-muted/95 hover:text-foreground"
                                  }`}
                                >
                                  <span
                                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                      isSelected
                                        ? "bg-primary animate-pulse"
                                        : "bg-muted-foreground/40"
                                    }`}
                                  />
                                  {opt}
                                </button>
                              );
                            })
                          ) : (
                            <span className="text-xs text-muted-foreground italic">
                              Teks Bebas (Bebas Input)
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })()}
              </div>
            ) : (
              <div className="border border-dashed border-border/60 bg-muted/10 rounded-2xl p-8 text-center space-y-2">
                <LuBox className="mx-auto text-primary" size={32} />
                <Typography
                  variant="small"
                  weight="bold"
                  className="text-sm text-foreground"
                >
                  Produk Tanpa Varian Terpilih
                </Typography>
                <p className="text-xs text-muted-foreground max-w-md mx-auto font-semibold">
                  Sistem akan membuat satu varian bawaan secara otomatis bernama{" "}
                  <span className="font-bold text-primary">"Default"</span>{" "}
                  dengan daftar attributes kosong. Anda dapat langsung melangkah
                  ke penentuan harga di Step 3.
                </p>
              </div>
            )}
          </div>

          {/* Sticky Footer */}
          <div className="p-6 border-t border-border/30 bg-muted/10 shrink-0 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setActiveStep(1)}
              className="h-10 px-5 rounded-xl font-bold flex items-center gap-2 border-border/50 hover:bg-muted/50 active:scale-95 transition-all"
              type="button"
            >
              <LuChevronLeft size={18} />
              Kembali
            </Button>
            <Button
              onClick={() => {
                setActiveStep(3);
              }}
              className="h-10 px-5 rounded-xl font-bold bg-primary hover:bg-primary/95 text-white active:scale-95 transition-all flex items-center gap-2"
              type="button"
              disabled={
                hasVariants
                  ? !selectedAttributeId || selectedOptions.length === 0
                  : false
              }
            >
              Lanjut ke Step 3
              <LuChevronRight size={18} />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: HARGA & TIERING */}
      {activeStep === 3 && (
        <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
          {/* Scrollable Container */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="space-y-1">
              <h2 className="text-lg font-black text-foreground flex items-center gap-2">
                <LuTags className="text-primary" size={22} />
                Matriks Harga & Tiering Varian
              </h2>
              <p className="text-xs text-muted-foreground font-semibold">
                Tentukan tier harga grosir bertingkat secara terpisah untuk
                kategori kemitraan Reseller dan End User.
              </p>
            </div>

            {/* List of Variant stacked cards */}
            <div className="space-y-6">
              {selectedOptions.map((opt) => {
                const pricing = variantPrices[opt] || {
                  reseller: [],
                  endUser: [],
                };

                return (
                  <div
                    key={opt}
                    className="border border-border/40 bg-card rounded-2xl p-6 shadow-sm space-y-4 hover:border-primary/20 transition-all duration-300"
                  >
                    {/* Variant Card Header */}
                    <div className="flex items-center gap-2.5 pb-2 border-b border-border/30">
                      <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-sm">
                        {opt.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-foreground">
                          Varian: {opt}
                        </h3>
                        <p className="text-[10px] text-muted-foreground font-semibold">
                          Konfigurasi harga bertingkat untuk opsi varian cetak
                          ini.
                        </p>
                      </div>
                    </div>

                    {/* Side-by-Side 2 Price Tiers */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                      {/* Reseller Pricing Column */}
                      <div className="space-y-3 bg-muted/10 border border-border/30 rounded-xl p-4 flex flex-col justify-between">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-primary border-b border-border/30 pb-2">
                            <LuUsers size={16} />
                            <h4 className="text-xs font-black tracking-wide uppercase">
                              Tier Harga Reseller
                            </h4>
                          </div>

                          <div className="space-y-3">
                            {pricing.reseller.map((tier, idx) => (
                              <div
                                key={tier.id}
                                className="flex items-end gap-2 bg-background p-2 rounded-lg border border-border/40 shadow-sm"
                              >
                                <div className="grid grid-cols-3 gap-2 flex-1">
                                  <div className="space-y-1">
                                    <span className="text-[9px] font-bold text-muted-foreground uppercase">
                                      Min Qty
                                    </span>
                                    <input
                                      type="number"
                                      value={tier.minQty}
                                      onChange={(e) => {
                                        const val =
                                          parseInt(e.target.value) || 0;
                                        setVariantPrices((prev) => {
                                          const updated = { ...prev };
                                          if (updated[opt]?.reseller[idx]) {
                                            updated[opt].reseller[idx].minQty =
                                              val;
                                          }
                                          return updated;
                                        });
                                      }}
                                      className="w-full text-xs font-semibold bg-background border border-border/80 outline-none rounded-md px-2 py-1.5 focus:border-primary/50 transition-all"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <span className="text-[9px] font-bold text-muted-foreground uppercase">
                                      Max Qty
                                    </span>
                                    <input
                                      type="number"
                                      value={tier.maxQty}
                                      onChange={(e) => {
                                        const val =
                                          parseInt(e.target.value) || 0;
                                        setVariantPrices((prev) => {
                                          const updated = { ...prev };
                                          if (updated[opt]?.reseller[idx]) {
                                            updated[opt].reseller[idx].maxQty =
                                              val;
                                          }
                                          return updated;
                                        });
                                      }}
                                      className="w-full text-xs font-semibold bg-background border border-border/80 outline-none rounded-md px-2 py-1.5 focus:border-primary/50 transition-all"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <span className="text-[9px] font-bold text-muted-foreground uppercase">
                                      Harga (Rp)
                                    </span>
                                    <input
                                      type="number"
                                      value={tier.price}
                                      onChange={(e) => {
                                        const val =
                                          parseInt(e.target.value) || 0;
                                        setVariantPrices((prev) => {
                                          const updated = { ...prev };
                                          if (updated[opt]?.reseller[idx]) {
                                            updated[opt].reseller[idx].price =
                                              val;
                                          }
                                          return updated;
                                        });
                                      }}
                                      className="w-full text-xs font-bold text-primary bg-background border border-border/80 outline-none rounded-md px-2 py-1.5 focus:border-primary/50 transition-all"
                                    />
                                  </div>
                                </div>
                                {pricing.reseller.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setVariantPrices((prev) => {
                                        const updated = { ...prev };
                                        if (updated[opt]) {
                                          updated[opt].reseller = updated[
                                            opt
                                          ].reseller.filter(
                                            (t) => t.id !== tier.id,
                                          );
                                        }
                                        return updated;
                                      });
                                    }}
                                    className="text-muted-foreground hover:text-rose-500 p-2 rounded-lg hover:bg-rose-500/10 active:scale-95 transition-all self-end"
                                    title="Hapus Tier"
                                  >
                                    <LuTrash2 size={15} />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          type="button"
                          onClick={() => {
                            setVariantPrices((prev) => {
                              const updated = { ...prev };
                              const target = updated[opt];
                              if (target) {
                                const resellerCopy = [...target.reseller];
                                const lastTier =
                                  resellerCopy[resellerCopy.length - 1];
                                const nextMin = (lastTier?.maxQty || 0) + 1;
                                resellerCopy.push({
                                  id: `res-${Date.now()}-${Math.random()}`,
                                  minQty: nextMin,
                                  maxQty: 999999,
                                  price: 0,
                                });
                                updated[opt] = {
                                  ...target,
                                  reseller: resellerCopy,
                                };
                              }
                              return updated;
                            });
                          }}
                          className="h-8 text-[10px] w-full border-dashed border-primary/30 text-primary bg-primary/5 hover:bg-primary/10 rounded-xl flex items-center justify-center gap-1.5 mt-3 active:scale-95 transition-all font-bold"
                        >
                          <LuPlus size={12} /> Tambah Tier Reseller
                        </Button>
                      </div>

                      {/* End User Pricing Column */}
                      <div className="space-y-3 bg-muted/10 border border-border/30 rounded-xl p-4 flex flex-col justify-between">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-primary border-b border-border/30 pb-2">
                            <LuUser size={16} />
                            <h4 className="text-xs font-black tracking-wide uppercase">
                              Tier Harga End User
                            </h4>
                          </div>

                          <div className="space-y-3">
                            {pricing.endUser.map((tier, idx) => (
                              <div
                                key={tier.id}
                                className="flex items-end gap-2 bg-background p-2 rounded-lg border border-border/40 shadow-sm"
                              >
                                <div className="grid grid-cols-3 gap-2 flex-1">
                                  <div className="space-y-1">
                                    <span className="text-[9px] font-bold text-muted-foreground uppercase">
                                      Min Qty
                                    </span>
                                    <input
                                      type="number"
                                      value={tier.minQty}
                                      onChange={(e) => {
                                        const val =
                                          parseInt(e.target.value) || 0;
                                        setVariantPrices((prev) => {
                                          const updated = { ...prev };
                                          if (updated[opt]?.endUser[idx]) {
                                            updated[opt].endUser[idx].minQty =
                                              val;
                                          }
                                          return updated;
                                        });
                                      }}
                                      className="w-full text-xs font-semibold bg-background border border-border/80 outline-none rounded-md px-2 py-1.5 focus:border-primary/50 transition-all"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <span className="text-[9px] font-bold text-muted-foreground uppercase">
                                      Max Qty
                                    </span>
                                    <input
                                      type="number"
                                      value={tier.maxQty}
                                      onChange={(e) => {
                                        const val =
                                          parseInt(e.target.value) || 0;
                                        setVariantPrices((prev) => {
                                          const updated = { ...prev };
                                          if (updated[opt]?.endUser[idx]) {
                                            updated[opt].endUser[idx].maxQty =
                                              val;
                                          }
                                          return updated;
                                        });
                                      }}
                                      className="w-full text-xs font-semibold bg-background border border-border/80 outline-none rounded-md px-2 py-1.5 focus:border-primary/50 transition-all"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <span className="text-[9px] font-bold text-muted-foreground uppercase">
                                      Harga (Rp)
                                    </span>
                                    <input
                                      type="number"
                                      value={tier.price}
                                      onChange={(e) => {
                                        const val =
                                          parseInt(e.target.value) || 0;
                                        setVariantPrices((prev) => {
                                          const updated = { ...prev };
                                          if (updated[opt]?.endUser[idx]) {
                                            updated[opt].endUser[idx].price =
                                              val;
                                          }
                                          return updated;
                                        });
                                      }}
                                      className="w-full text-xs font-bold text-primary bg-background border border-border/80 outline-none rounded-md px-2 py-1.5 focus:border-primary/50 transition-all"
                                    />
                                  </div>
                                </div>
                                {pricing.endUser.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setVariantPrices((prev) => {
                                        const updated = { ...prev };
                                        if (updated[opt]) {
                                          updated[opt].endUser = updated[
                                            opt
                                          ].endUser.filter(
                                            (t) => t.id !== tier.id,
                                          );
                                        }
                                        return updated;
                                      });
                                    }}
                                    className="text-muted-foreground hover:text-rose-500 p-2 rounded-lg hover:bg-rose-500/10 active:scale-95 transition-all self-end"
                                    title="Hapus Tier"
                                  >
                                    <LuTrash2 size={15} />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          type="button"
                          onClick={() => {
                            setVariantPrices((prev) => {
                              const updated = { ...prev };
                              const target = updated[opt];
                              if (target) {
                                const endUserCopy = [...target.endUser];
                                const lastTier =
                                  endUserCopy[endUserCopy.length - 1];
                                const nextMin = (lastTier?.maxQty || 0) + 1;
                                endUserCopy.push({
                                  id: `end-${Date.now()}-${Math.random()}`,
                                  minQty: nextMin,
                                  maxQty: 999999,
                                  price: 0,
                                });
                                updated[opt] = {
                                  ...target,
                                  endUser: endUserCopy,
                                };
                              }
                              return updated;
                            });
                          }}
                          className="h-8 text-[10px] w-full border-dashed border-primary/30 text-primary bg-primary/5 hover:bg-primary/10 rounded-xl flex items-center justify-center gap-1.5 mt-3 active:scale-95 transition-all font-bold"
                        >
                          <LuPlus size={12} /> Tambah Tier End User
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sticky Footer */}
          <div className="p-6 border-t border-border/30 bg-muted/10 shrink-0 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setActiveStep(2)}
              className="h-10 px-5 rounded-xl font-bold flex items-center gap-2 border-border/50 hover:bg-muted/50 active:scale-95 transition-all"
              type="button"
            >
              <LuChevronLeft size={18} />
              Kembali
            </Button>
            <Button
              onClick={() => {
                const step1 = getValues();
                const activeAttr = attributes.find(
                  (a) => a.id === selectedAttributeId,
                );
                const selectedCatObj = categories.find(
                  (c) => c.name === step1.category,
                );

                // Helper to generate SKU elegantly from name
                const generateSKU = (prodName: string) => {
                  if (!prodName) return "PRD-TEMP";
                  const clean = prodName
                    .toUpperCase()
                    .replace(/[^A-Z0-9 ]/g, "");
                  const parts = clean.split(" ").filter(Boolean);
                  let prefix = "";
                  if (parts.length >= 2) {
                    prefix = parts
                      .slice(0, 2)
                      .map((p) => p.substring(0, 3))
                      .join("-");
                  } else if (parts[0]) {
                    prefix = parts[0].substring(0, 3);
                  } else {
                    prefix = "PRD";
                  }
                  return `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
                };

                const RESELLER_LEVEL_ID =
                  "d2c67ef8-82e4-4d8b-968b-5a1e2f5b6154";
                const END_USER_LEVEL_ID =
                  "b3c8f3a3-b26a-4638-b7f2-841a54774844";

                const payload: ProductModel = {
                  name: step1.name,
                  category_id: selectedCatObj?.id || "",
                  sku: generateSKU(step1.name),
                  uom: step1.uom,
                  base_price: 0,
                  description: step1.description,
                  variants: selectedOptions.map((opt) => {
                    const pricing = variantPrices[opt] || {
                      reseller: [],
                      endUser: [],
                    };

                    // Flattened list of price tiers with customer level IDs
                    const priceTiersList = [
                      ...pricing.reseller.map((t) => ({
                        customer_level_id: RESELLER_LEVEL_ID,
                        min_qty: t.minQty,
                        max_qty: t.maxQty,
                        price_per_unit: t.price,
                      })),
                      ...pricing.endUser.map((t) => ({
                        customer_level_id: END_USER_LEVEL_ID,
                        min_qty: t.minQty,
                        max_qty: t.maxQty,
                        price_per_unit: t.price,
                      })),
                    ];

                    return {
                      variant_name: opt,
                      additional_cost: 0,
                      attributes: activeAttr
                        ? [
                            {
                              attribute_id: activeAttr.id,
                              value: opt,
                            },
                          ]
                        : [],
                      price_tiers: priceTiersList,
                    };
                  }),
                };

                console.log(
                  "%c🚀 [BACKEND PAYLOAD BODY] SENDING:",
                  "color: #10b981; font-weight: bold; font-size: 13px;",
                  payload,
                );
                createMutation.mutate(payload);
              }}
              className="h-10 px-5 rounded-xl font-bold bg-primary hover:bg-primary/95 text-white active:scale-95 transition-all flex items-center gap-2"
              type="button"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan Produk"
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormProduct;

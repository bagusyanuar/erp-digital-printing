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
} from "@erp-digital-printing/ui/icons";
import { useForm } from "react-hook-form";
import { toast } from "@erp-digital-printing/ui/Toast";
import { useQuery } from "@tanstack/react-query";
import { useCategoryDI } from "@presentation/category/hooks/useCategoryDI";
import { categoryKeys } from "@infrastructure/category/keys";

interface FormProductProps {
  onBack: () => void;
}

interface Step1Inputs {
  name: string;
  category: string;
  uom: "m2" | "pcs" | "m_lari" | "box";
  description: string;
}

const FormProduct: React.FC<FormProductProps> = ({ onBack }) => {
  const [activeStep, setActiveStep] = useState<number>(1);
  
  const { getCategoriesUseCase } = useCategoryDI();

  // Fetch categories dynamically from backend DI
  const { data: categoryResponse, isLoading: isLoadingCategories } = useQuery({
    queryKey: categoryKeys.list({ limit: 100, page: 1 }),
    queryFn: () => getCategoriesUseCase.execute({ limit: 100, page: 1 }),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  const categories = categoryResponse?.data ?? [];

  const {
    register,
    handleSubmit,
    formState: { errors },
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
    toast.success("Step 1 Valid!", "Informasi dasar produk telah terisi dengan benar.");
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
        <form onSubmit={handleNextStep1} className="flex-1 flex flex-col overflow-hidden">
          
          {/* Scrollable Container */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="space-y-1">
              <h2 className="text-lg font-black text-foreground flex items-center gap-2">
                <LuBox className="text-primary" size={22} />
                Detail Informasi Produk Dasar
              </h2>
              <p className="text-xs text-muted-foreground font-semibold">
                Masukkan detail nama produk, kategori payung besar, satuan hitung dasar (UoM), serta deskripsi.
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
                  <Typography variant="small" weight="bold" className="text-xs text-foreground/80">
                    Nama Produk / Bahan <span className="text-rose-500">*</span>
                  </Typography>
                  <TextField
                    placeholder="Contoh: Flexi Banner 280g, Art Paper 150g, dll"
                    className="border-border/50 focus:bg-background transition-all h-10"
                    {...register("name", { required: "Nama produk wajib diisi" })}
                  />
                  {errors.name && (
                    <p className="text-[11px] text-rose-500 font-bold mt-1">{errors.name.message}</p>
                  )}
                </div>

                {/* Kategori Produk */}
                <div className="space-y-1.5">
                  <Typography variant="small" weight="bold" className="text-xs text-foreground/80">
                    Kategori <span className="text-rose-500">*</span>
                  </Typography>
                  <select
                    className="w-full border border-border/50 rounded-xl px-3 py-2 text-sm bg-card hover:bg-muted/30 focus:bg-background h-10 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-semibold"
                    disabled={isLoadingCategories}
                    {...register("category", { required: "Kategori wajib dipilih" })}
                  >
                    <option value="">
                      {isLoadingCategories ? "Memuat Kategori..." : "-- Pilih Kategori --"}
                    </option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="text-[11px] text-rose-500 font-bold mt-1">{errors.category.message}</p>
                  )}
                </div>

                {/* Satuan UoM */}
                <div className="space-y-1.5">
                  <Typography variant="small" weight="bold" className="text-xs text-foreground/80">
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
                    <p className="text-[11px] text-rose-500 font-bold mt-1">{errors.uom.message}</p>
                  )}
                </div>

                {/* Deskripsi */}
                <div className="space-y-1.5 md:col-span-2">
                  <Typography variant="small" weight="bold" className="text-xs text-foreground/80">
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

      {/* STEP 2: KONFIGURASI VARIAN (LOCK/EMPTY AS REQUESTED) */}
      {activeStep === 2 && (
        <div className="flex-1 flex flex-col overflow-hidden">
          
          {/* Scrollable Container */}
          <div className="flex-1 overflow-y-auto p-10 flex flex-col items-center justify-center text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20 animate-pulse">
              <LuSlidersHorizontal className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-foreground">Step 2: Konfigurasi Varian (Disabled)</h3>
              <p className="text-muted-foreground text-sm max-w-sm">
                Langkah variasi atribut EAV dikunci untuk demonstrasi tahap awal.
              </p>
            </div>
          </div>

          {/* Sticky Footer */}
          <div className="p-6 border-t border-border/30 bg-muted/10 shrink-0 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setActiveStep(1)}
              className="h-10 px-5 rounded-xl font-bold flex items-center gap-2"
              type="button"
            >
              <LuChevronLeft size={18} />
              Kembali
            </Button>
            <Button
              onClick={() => setActiveStep(3)}
              className="h-10 px-5 rounded-xl font-bold flex items-center gap-2 font-semibold"
              type="button"
            >
              Lanjut ke Step 3
              <LuChevronRight size={18} />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: HARGA & TIERING (LOCK/EMPTY AS REQUESTED) */}
      {activeStep === 3 && (
        <div className="flex-1 flex flex-col overflow-hidden">
          
          {/* Scrollable Container */}
          <div className="flex-1 overflow-y-auto p-10 flex flex-col items-center justify-center text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20 animate-pulse">
              <LuTags className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-foreground">Step 3: Harga & Tiering (Disabled)</h3>
              <p className="text-muted-foreground text-sm max-w-sm">
                Matriks harga tiering grosir reseller/retail dikunci untuk demonstrasi tahap awal.
              </p>
            </div>
          </div>

          {/* Sticky Footer */}
          <div className="p-6 border-t border-border/30 bg-muted/10 shrink-0 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setActiveStep(2)}
              className="h-10 px-5 rounded-xl font-bold flex items-center gap-2"
              type="button"
            >
              <LuChevronLeft size={18} />
              Kembali
            </Button>
            <Button
              onClick={() => {
                toast.success("Produk Berhasil Dibuat", "Demo data step 1 telah berhasil di-submit.");
                onBack();
              }}
              className="h-10 px-5 rounded-xl font-bold bg-primary hover:bg-primary/95 text-white active:scale-95 transition-all"
              type="button"
            >
              Simpan Demo Produk
            </Button>
          </div>
        </div>
      )}

    </div>
  );
};

export default FormProduct;

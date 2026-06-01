import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@erp-digital-printing/ui/Button";
import { TextField } from "@erp-digital-printing/ui/TextField";
import { Typography } from "@erp-digital-printing/ui/Typography";
import { HelperText } from "@erp-digital-printing/ui/HelperText";
import { Card, CardHeader, CardContent } from "@erp-digital-printing/ui/Card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@erp-digital-printing/ui/Table";

import {
  LuArrowLeft,
  LuPlus,
  LuTrash2,
  LuSend,
  LuBox,
  LuScissors,
  LuFileText,
  LuUser,
  LuChevronLeft,
  LuInfo,
  LuPencil,
} from "@erp-digital-printing/ui/icons";

import { toast } from "@erp-digital-printing/ui/Toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useCategoryDI } from "@presentation/category/hooks/useCategoryDI";
import { categoryKeys } from "@infrastructure/category/keys";
import { useProductDI } from "@presentation/product/hooks/useProductDI";
import { productKeys } from "@infrastructure/product/keys";
import { useOrderDI } from "@presentation/order/hooks/useOrderDI";
import { useResellerDI } from "@presentation/reseller/hooks/useResellerDI";
import { resellerKeys } from "@infrastructure/reseller/keys";
import type { SaveDraftOrderInput } from "@core/order/applications/inputs/order.input";
import type { AppError } from "@core/shared/errors/domain.error";

interface JobItem {
  id: string;
  product_variant_id: string;
  productName: string;
  dimension: string;
  qty: number;
  uom: string;
  production_notes: string;
  finishing_ids: string[];
  length_cm?: number;
  width_cm?: number;
}

interface JobTransaction {
  id: string;
  ticketNo: string;
  customerName: string;
  customerLevel: string;
  status: "Pending" | "Dikirim ke Kasir";
  createdAt: string;
  items: JobItem[];
  notes?: string;
}

const CreateJobEntryPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");

  // Fetch Categories, Products, and Order usecases from DI
  const { getCategoriesUseCase } = useCategoryDI();
  const { getProductsUseCase } = useProductDI();
  const { saveDraftOrderUseCase } = useOrderDI();
  const { getResellersUseCase } = useResellerDI();

  const { data: categoryResponse } = useQuery({
    queryKey: categoryKeys.list({ limit: 100, page: 1 }),
    queryFn: () => getCategoriesUseCase.execute({ limit: 100, page: 1 }),
    staleTime: 30_000,
  });

  const { data: productResponse } = useQuery({
    queryKey: productKeys.list({ limit: 200, page: 1 }),
    queryFn: () => getProductsUseCase.execute({ limit: 200, page: 1 }),
    staleTime: 30_000,
  });

  const { data: resellerResponse } = useQuery({
    queryKey: resellerKeys.list({ limit: 100, page: 1 }),
    queryFn: () => getResellersUseCase.execute({ limit: 100, page: 1 }),
    staleTime: 30_000,
  });

  const categories = useMemo(
    () => categoryResponse?.data ?? [],
    [categoryResponse],
  );
  const products = useMemo(
    () => productResponse?.data ?? [],
    [productResponse],
  );
  const resellers = useMemo(
    () => resellerResponse?.data ?? [],
    [resellerResponse],
  );

  // Load existing ticket details if we are in Edit Mode
  const foundEditTransaction = useMemo((): JobTransaction | null => {
    if (!editId) return null;
    const savedTx = localStorage.getItem("job_entry_transactions");
    if (savedTx) {
      try {
        const list: JobTransaction[] = JSON.parse(savedTx);
        return list.find((t) => t.id === editId) || null;
      } catch (e) {
        console.error("Failed to parse transactions", e);
      }
    }
    return null;
  }, [editId]);

  // States untuk Right Column (Order Metadata & Cart)
  const [customerType, setCustomerType] = useState<"end_user" | "reseller">("end_user");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [selectedResellerId, setSelectedResellerId] = useState("");

  const [notes, setNotes] = useState(() => {
    if (foundEditTransaction) {
      return foundEditTransaction.notes || "";
    }
    return localStorage.getItem("job_entry_active_notes") || "";
  });
  const [cartItems, setCartItems] = useState<JobItem[]>(() => {
    if (foundEditTransaction) {
      return foundEditTransaction.items;
    }
    const saved = localStorage.getItem("job_entry_active_cart");
    return saved ? JSON.parse(saved) : [];
  });

  // Tampilkan toast mode edit satu kali saat terdeteksi
  useEffect(() => {
    if (foundEditTransaction) {
      toast.success(
        "Mode Ubah Tiket",
        `Memuat data transaksi ${foundEditTransaction.ticketNo}`,
      );
    }
  }, [foundEditTransaction]);

  // State Form Kiri (Technical Specification Builder)
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedVariant, setSelectedVariant] = useState("");
  const [qty, setQty] = useState<number>(1);
  const [lengthCm, setLengthCm] = useState<string>("");
  const [widthCm, setWidthCm] = useState<string>("");
  const [productionNotes, setProductionNotes] = useState("");

  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // Edit Cart Item Helper
  const handleEditCartItem = (item: JobItem) => {
    setEditingItemId(item.id);

    // Find matching product
    const foundProduct = products.find((p) =>
      item.productName.startsWith(p.name),
    );
    if (foundProduct) {
      const foundCategory = categories.find(
        (c) => c.id === foundProduct.category_id,
      );
      if (foundCategory) {
        setSelectedCategory(foundCategory.name);
      }
      setSelectedProduct(foundProduct.name);

      // Extract variant
      if (foundProduct.variants && foundProduct.variants.length > 0) {
        const matchingVar = foundProduct.variants.find(
          (v) => v.id === item.product_variant_id,
        );
        if (matchingVar) {
          setSelectedVariant(matchingVar.variant_name);
        } else {
          setSelectedVariant("");
        }
      } else {
        setSelectedVariant("");
      }
    } else {
      setSelectedProduct(item.productName);
    }

    // Parse dimensions if meteran
    if (item.dimension.includes("x")) {
      const parts = item.dimension.split("x");
      if (parts[0] && parts[1]) {
        setLengthCm(parts[0].trim());
        const widthPart = parts[1].split("cm")[0];
        if (widthPart) {
          setWidthCm(widthPart.trim());
        }
      }
    } else {
      setLengthCm("");
      setWidthCm("");
    }

    setQty(item.qty);
    setProductionNotes(item.production_notes || "");
    toast.info("Ubah Item", `Sedang mengubah item: ${item.productName}`);
  };

  useEffect(() => {
    if (!editId) {
      localStorage.setItem("job_entry_active_notes", notes);
    }
  }, [notes, editId]);

  useEffect(() => {
    if (!editId) {
      localStorage.setItem("job_entry_active_cart", JSON.stringify(cartItems));
    }
  }, [cartItems, editId]);

  // Cascading Filter: Filter products based on selected category
  const filteredProducts = useMemo(() => {
    if (!selectedCategory) return [];
    const catObj = categories.find((c) => c.name === selectedCategory);
    if (!catObj) return [];
    return products.filter((p) => p.category_id === catObj.id);
  }, [selectedCategory, categories, products]);

  // Cascading Filter: Variants lists based on selected product (Fetched from product variants in DB)
  const productVariants = useMemo((): string[] => {
    if (!selectedProduct) return [];
    const foundProduct = products.find((p) => p.name === selectedProduct);
    if (foundProduct?.variants && foundProduct.variants.length > 0) {
      return foundProduct.variants.map((v) => v.variant_name);
    }
    return [];
  }, [selectedProduct, products]);

  // Get active product's UoM
  const activeProductUoM = useMemo(() => {
    if (!selectedProduct) return "";
    const found = products.find((p) => p.name === selectedProduct);
    return found?.uom || "pcs";
  }, [selectedProduct, products]);

  // Determine if size inputs should be displayed (if UoM is m2 or m_lari)
  const showSizeFields = useMemo(() => {
    return activeProductUoM === "m2" || activeProductUoM === "m_lari";
  }, [activeProductUoM]);

  // Reset Product and Variant when Category changes
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
    setSelectedProduct("");
    setSelectedVariant("");
  };

  // Reset Variant when Product changes
  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedProduct(e.target.value);
    setSelectedVariant("");
  };

  // Add Item to active cart
  const handleAddItemToCart = () => {
    if (!selectedProduct) {
      toast.error("Validasi Gagal", "Silakan pilih produk terlebih dahulu");
      return;
    }
    if (showSizeFields && (!lengthCm || !widthCm)) {
      toast.error(
        "Validasi Gagal",
        "Panjang & Lebar wajib diisi untuk produk meteran",
      );
      return;
    }

    // Format dimension text based on UoM
    let dimensionText = "Pcs";
    if (activeProductUoM === "m2") {
      dimensionText = `${lengthCm} x ${widthCm} cm (m²)`;
    } else if (activeProductUoM === "m_lari") {
      dimensionText = `${lengthCm} x ${widthCm} cm (m_lari)`;
    } else if (activeProductUoM === "box") {
      dimensionText = "Box";
    } else if (activeProductUoM === "lembar") {
      dimensionText = "Lembar A3+";
    }

    // Find the correct product variant id
    const foundProduct = products.find((p) => p.name === selectedProduct);
    let variantId = "00000000-0000-0000-0000-000000000000";
    if (foundProduct) {
      if (selectedVariant && foundProduct.variants) {
        const matchVar = foundProduct.variants.find(
          (v) => v.variant_name === selectedVariant,
        );
        if (matchVar?.id) {
          variantId = matchVar.id;
        }
      } else if (foundProduct.variants?.[0]?.id) {
        variantId = foundProduct.variants[0].id;
      }
    }

    const lengthNum =
      showSizeFields && lengthCm ? parseFloat(lengthCm) : undefined;
    const widthNum =
      showSizeFields && widthCm ? parseFloat(widthCm) : undefined;

    if (editingItemId) {
      // Edit Mode: update the existing item in the cart
      setCartItems((prev) =>
        prev.map((item) =>
          item.id === editingItemId
            ? {
                ...item,
                product_variant_id: variantId,
                productName: `${selectedProduct}${selectedVariant ? ` (${selectedVariant})` : ""}`,
                dimension: dimensionText,
                qty: qty,
                uom: activeProductUoM,
                production_notes: productionNotes,
                length_cm: lengthNum,
                width_cm: widthNum,
              }
            : item,
        ),
      );
      setEditingItemId(null);
      toast.success(
        "Item Diperbarui",
        "Item cetakan berhasil diperbarui di keranjang.",
      );
    } else {
      // Create Mode: add a new item
      const newItem: JobItem = {
        id: `item-${Date.now()}-${Math.random()}`,
        product_variant_id: variantId,
        productName: `${selectedProduct}${selectedVariant ? ` (${selectedVariant})` : ""}`,
        dimension: dimensionText,
        qty: qty,
        uom: activeProductUoM,
        production_notes: productionNotes,
        finishing_ids: [],
        length_cm: lengthNum,
        width_cm: widthNum,
      };
      setCartItems((prev) => [...prev, newItem]);
      toast.success(
        "Item Ditambahkan",
        "Item cetakan berhasil masuk ke draf keranjang desainer.",
      );
    }

    // Reset Form Kiri
    setSelectedCategory("");
    setSelectedProduct("");
    setSelectedVariant("");
    setQty(1);
    setLengthCm("");
    setWidthCm("");
    setProductionNotes("");
  };

  // Remove Item from cart
  const handleRemoveCartItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
    toast.info("Item Dihapus", "Item cetakan dikeluarkan dari draf keranjang.");
  };

  // React Query Mutation to POST /orders/draft
  const saveDraftMutation = useMutation<void, AppError, SaveDraftOrderInput>({
    mutationFn: (payload: SaveDraftOrderInput) =>
      saveDraftOrderUseCase.execute(payload),
    onSuccess: () => {
      toast.success(
        "Tiket Berhasil Disimpan",
        "Tiket pesanan berhasil disimpan sebagai draft.",
      );

      // Clear active states
      setNotes("");
      setCartItems([]);
      localStorage.removeItem("job_entry_active_notes");
      localStorage.removeItem("job_entry_active_cart");

      navigate("/job-entry");
    },
    onError: (error: AppError) => {
      toast.error(
        "Gagal Menyimpan Tiket",
        error.message || "Terjadi kesalahan saat menyimpan draft.",
      );
    },
  });

  // Submit job entry ticket to backend "Kasir" queue
  const handleSubmitTicket = () => {
    if (!customerName.trim()) {
      toast.error(
        "Input Wajib",
        "Nama pelanggan wajib diisi atau dipilih!",
      );
      return;
    }
    if (cartItems.length === 0) {
      toast.error(
        "Keranjang Kosong",
        "Draf keranjang belanja Anda masih kosong!",
      );
      return;
    }

    const payload = {
      designer_id: "4f2411ec-ef69-476f-9549-85de0fa097ab", // Hardcoded Administrator UUID
      reseller_id: customerType === "reseller" && selectedResellerId ? selectedResellerId : null,
      customer_name: customerName.trim(),
      customer_phone: customerPhone.trim(),
      notes: notes.trim(),
      items: cartItems.map((item) => ({
        product_variant_id: item.product_variant_id,
        uom: item.uom,
        quantity: item.qty,
        design_file_url: "", // Left empty as requested
        production_notes: item.production_notes || "",
        finishing_ids: [], // Left empty as requested
        length_cm: item.length_cm,
        width_cm: item.width_cm,
      })),
    };

    saveDraftMutation.mutate(payload);
  };

  const handleCancel = () => {
    if (cartItems.length > 0 && !editId) {
      if (
        confirm(
          "Draf keranjang Anda tidak akan hilang (tersimpan otomatis). Apakah Anda yakin ingin kembali?",
        )
      ) {
        navigate("/job-entry");
      }
    } else {
      navigate("/job-entry");
    }
  };

  return (
    <div className="p-6 space-y-6 font-sans bg-background min-h-screen animate-in fade-in duration-500">
      {/* Header Navigation */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-xl hover:bg-muted border-border/50 active:scale-95 transition-all"
          onClick={handleCancel}
          type="button"
        >
          <LuArrowLeft size={20} className="text-muted-foreground" />
        </Button>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">
            {editId ? "Ubah Tiket Job Entry" : "Buat Tiket Job Entry Baru"}
          </h1>
          <p className="text-muted-foreground font-semibold text-xs mt-0.5">
            {editId
              ? "Ubah detail informasi pelanggan atau item cetakan aktif."
              : "Desainer: Input parameter teknis & file cetak pelanggan (harga diproses kasir)."}
          </p>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* KOLOM KIRI: Form Input Spesifikasi Item (width: 6/12) */}
        <div className="lg:col-span-6 space-y-6">
          <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden bg-card">
            <CardHeader className="border-b border-border/30 p-5 bg-card">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <LuBox className="text-primary" size={20} />
                Spesifikasi Item Cetakan
              </h2>
              <p className="text-[11px] text-muted-foreground font-medium">
                Pilih kategori dan jenis bahan secara berjenjang, lalu tentukan
                dimensi dan finishing teknis.
              </p>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              {/* Cascade 1: Kategori */}
              <div className="space-y-1.5">
                <Typography
                  variant="small"
                  weight="bold"
                  className="text-xs text-foreground/80"
                >
                  Kategori Produk <span className="text-rose-500">*</span>
                </Typography>
                <select
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  className="w-full border border-border/50 rounded-xl px-3 py-2 text-sm bg-card hover:bg-muted/30 focus:bg-background h-10 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-semibold"
                >
                  <option value="">-- Pilih Kategori --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cascade 2: Produk (hanya aktif jika kategori terpilih) */}
              <div className="space-y-1.5">
                <Typography
                  variant="small"
                  weight="bold"
                  className="text-xs text-foreground/80"
                >
                  Produk / Bahan <span className="text-rose-500">*</span>
                </Typography>
                <select
                  value={selectedProduct}
                  onChange={handleProductChange}
                  disabled={!selectedCategory}
                  className="w-full border border-border/50 rounded-xl px-3 py-2 text-sm bg-card hover:bg-muted/30 focus:bg-background h-10 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">-- Pilih Produk/Bahan --</option>
                  {filteredProducts.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cascade 3: Varian (jika ada varian bawaan) */}
              <div className="space-y-1.5">
                <Typography
                  variant="small"
                  weight="bold"
                  className="text-xs text-foreground/80"
                >
                  Variasi Produk{" "}
                  <span className="text-xs text-muted-foreground font-normal">
                    (Opsional)
                  </span>
                </Typography>
                <select
                  value={selectedVariant}
                  onChange={(e) => setSelectedVariant(e.target.value)}
                  disabled={!selectedProduct || productVariants.length === 0}
                  className="w-full border border-border/50 rounded-xl px-3 py-2 text-sm bg-card hover:bg-muted/30 focus:bg-background h-10 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {!selectedProduct
                      ? "-- Pilih Varian --"
                      : productVariants.length > 0
                        ? "-- Pilih Varian --"
                        : "-- Tidak Ada Variasi --"}
                  </option>
                  {productVariants.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dynamic Size Inputs (Panjang x Lebar) */}
              {showSizeFields && (
                <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-primary/5 border border-primary/10 animate-in slide-in-from-top-3 duration-300">
                  <div className="space-y-1.5">
                    <Typography
                      variant="small"
                      weight="bold"
                      className="text-xs text-primary"
                    >
                      Panjang (cm) <span className="text-rose-500">*</span>
                    </Typography>
                    <TextField
                      type="number"
                      placeholder="Contoh: 300"
                      value={lengthCm}
                      onChange={(e) => setLengthCm(e.target.value)}
                      className="h-10 bg-card border-primary/20 focus:bg-background font-semibold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Typography
                      variant="small"
                      weight="bold"
                      className="text-xs text-primary"
                    >
                      Lebar (cm) <span className="text-rose-500">*</span>
                    </Typography>
                    <TextField
                      type="number"
                      placeholder="Contoh: 100"
                      value={widthCm}
                      onChange={(e) => setWidthCm(e.target.value)}
                      className="h-10 bg-card border-primary/20 focus:bg-background font-semibold"
                    />
                  </div>
                  <HelperText className="col-span-2 text-[10px] text-primary/70 font-semibold flex items-center gap-1">
                    <LuInfo size={12} />
                    UoM Produk ini adalah <strong>{activeProductUoM}</strong>.
                    Silakan masukkan spesifikasi ukuran riil untuk operator.
                  </HelperText>
                </div>
              )}

              {/* Qty Input */}
              <div className="space-y-1.5 max-w-[200px]">
                <Typography
                  variant="small"
                  weight="bold"
                  className="text-xs text-foreground/80"
                >
                  Quantity <span className="text-rose-500">*</span>
                </Typography>
                <TextField
                  type="number"
                  min={1}
                  value={qty}
                  onChange={(e) =>
                    setQty(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  className="h-10"
                />
              </div>

              {/* Catatan Produksi Item Input */}
              <div className="space-y-1.5">
                <Typography
                  variant="small"
                  weight="bold"
                  className="text-xs text-foreground/80"
                >
                  Catatan Produksi{" "}
                  <span className="text-xs text-muted-foreground font-normal">
                    (Instruksi Khusus Operator)
                  </span>
                </Typography>
                <TextField
                  placeholder="Contoh: Laminating glossy saja, potong pas"
                  value={productionNotes}
                  onChange={(e) => setProductionNotes(e.target.value)}
                  className="h-10 font-semibold"
                />
              </div>

              {/* Button Tambah/Perbarui ke Keranjang */}
              {editingItemId ? (
                <div className="flex gap-3 mt-2 animate-in fade-in duration-300">
                  <Button
                    onClick={handleAddItemToCart}
                    disabled={!selectedProduct}
                    className="flex-1 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-600/10 flex items-center justify-center gap-2 active:scale-95 transition-all"
                  >
                    <LuPencil size={16} />
                    Perbarui Item di Keranjang
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingItemId(null);
                      setSelectedCategory("");
                      setSelectedProduct("");
                      setSelectedVariant("");
                      setQty(1);
                      setLengthCm("");
                      setWidthCm("");
                      toast.info(
                        "Ubah Dibatalkan",
                        "Perubahan item dibatalkan.",
                      );
                    }}
                    className="h-11 px-4 rounded-xl border-border/50 hover:bg-muted/50 font-bold active:scale-95 transition-all"
                  >
                    Batal
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={handleAddItemToCart}
                  disabled={!selectedProduct}
                  className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-md shadow-primary/10 flex items-center justify-center gap-2 active:scale-95 transition-all mt-2"
                >
                  <LuPlus size={16} />
                  Masukkan ke Keranjang Draf
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* KOLOM KANAN: Draf Keranjang & Metadata Transaksi (width: 6/12) */}
        <div className="lg:col-span-6 space-y-6">
          <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden bg-card">
            <CardHeader className="border-b border-border/30 p-5 bg-card">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <LuFileText className="text-primary" size={20} />
                Detail Transaksi & Keranjang
              </h2>
              <p className="text-[11px] text-muted-foreground font-medium">
                Masukkan memo transaksi untuk identifikasi kasir dan tinjau
                seluruh item cetakan aktif.
              </p>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {/* Tipe Pelanggan (Chips) */}
              <div className="space-y-2">
                <Typography
                  variant="small"
                  weight="bold"
                  className="text-xs text-foreground/80 flex items-center gap-1.5"
                >
                  <LuUser size={14} className="text-primary/70" />
                  Tipe Pelanggan <span className="text-rose-500">*</span>
                </Typography>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCustomerType("end_user");
                      setCustomerName("");
                      setCustomerPhone("");
                      setSelectedResellerId("");
                    }}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all border active:scale-95 ${
                      customerType === "end_user"
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-background text-muted-foreground border-border hover:bg-muted/30"
                    }`}
                  >
                    R: Retail
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomerType("reseller");
                      setCustomerName("");
                      setCustomerPhone("");
                      setSelectedResellerId("");
                    }}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all border active:scale-95 ${
                      customerType === "reseller"
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-background text-muted-foreground border-border hover:bg-muted/30"
                    }`}
                  >
                    B: Biro / Reseller
                  </button>
                </div>
              </div>

              {/* Input Dinamis berdasarkan Tipe Pelanggan */}
              {customerType === "end_user" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-muted/20 border border-border/40 animate-in fade-in duration-300">
                  <div className="space-y-1.5">
                    <Typography variant="small" weight="bold" className="text-xs text-foreground/80">
                      Nama Customer <span className="text-rose-500">*</span>
                    </Typography>
                    <TextField
                      placeholder="Contoh: Budi Santoso"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="h-10 font-semibold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Typography variant="small" weight="bold" className="text-xs text-foreground/80">
                      No. Telepon
                    </Typography>
                    <TextField
                      placeholder="Contoh: 0812xxxx"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="h-10 font-semibold"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-primary/5 border border-primary/10 animate-in fade-in duration-300">
                  <div className="space-y-1.5">
                    <Typography variant="small" weight="bold" className="text-xs text-primary">
                      Pilih Reseller <span className="text-rose-500">*</span>
                    </Typography>
                    <select
                      value={selectedResellerId}
                      onChange={(e) => {
                        const resellerId = e.target.value;
                        setSelectedResellerId(resellerId);
                        const selected = resellers.find((r) => r.id === resellerId);
                        if (selected) {
                          setCustomerName(selected.name);
                          setCustomerPhone(selected.phone);
                        } else {
                          setCustomerName("");
                          setCustomerPhone("");
                        }
                      }}
                      className="w-full border border-primary/20 rounded-xl px-3 py-2 text-sm bg-card hover:bg-muted/30 focus:bg-background h-10 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-semibold"
                    >
                      <option value="">-- Pilih Reseller --</option>
                      {resellers.map((reseller) => (
                        <option key={reseller.id} value={reseller.id}>
                          {reseller.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Typography variant="small" weight="bold" className="text-xs text-primary">
                      No. Telepon Reseller
                    </Typography>
                    <TextField
                      value={customerPhone}
                      disabled
                      placeholder="Pilih reseller terlebih dahulu"
                      className="h-10 bg-muted/50 border-primary/10 font-semibold text-muted-foreground cursor-not-allowed"
                    />
                  </div>
                </div>
              )}

              {/* Memo/Catatan Umum */}
              <div className="space-y-1.5">
                <Typography
                  variant="small"
                  weight="bold"
                  className="text-xs text-foreground/80 flex items-center gap-1.5"
                >
                  <LuFileText size={14} className="text-primary/70" />
                  Memo Transaksi <span className="text-rose-500">*</span>{" "}
                  <span className="text-[10px] text-muted-foreground font-normal">
                    (Identifikasi Nota)
                  </span>
                </Typography>
                <TextField
                  placeholder="Contoh: Spanduk Warung Padang Pak Anto"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="h-10 font-semibold"
                />
              </div>

              {/* Cart List Review (Table) */}
              <div className="space-y-3 pt-3 border-t border-border/30">
                <Typography
                  variant="small"
                  weight="bold"
                  className="text-xs text-muted-foreground uppercase tracking-wider block"
                >
                  Daftar Cetakan Ritel ({cartItems.length} Item)
                </Typography>

                <div className="border border-border/40 rounded-2xl overflow-hidden bg-card">
                  <div className="overflow-x-auto w-full">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-10 text-center font-bold text-xs py-2 bg-muted/30">
                            No
                          </TableHead>
                          <TableHead className="font-bold text-xs py-2 bg-muted/30">
                            Detail Cetakan & Finishing
                          </TableHead>
                          <TableHead className="font-bold text-xs py-2 bg-muted/30">
                            Ukuran
                          </TableHead>
                          <TableHead className="w-12 font-bold text-xs py-2 bg-muted/30 text-center">
                            Qty
                          </TableHead>
                          <TableHead className="w-10 text-center font-bold text-xs py-2 bg-muted/30">
                            Aksi
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cartItems.length > 0 ? (
                          cartItems.map((item, idx) => (
                            <TableRow
                              key={item.id}
                              className="hover:bg-muted/10 transition-colors"
                            >
                              {/* 1. Sequential Index */}
                              <TableCell className="text-center font-bold text-xs text-muted-foreground py-2.5">
                                {idx + 1}
                              </TableCell>

                              {/* 2. Product name & technical specifications */}
                              <TableCell className="py-2.5 min-w-[150px]">
                                <div className="space-y-0.5">
                                  <span className="text-xs font-black text-foreground block leading-tight">
                                    {item.productName}
                                  </span>
                                </div>
                              </TableCell>

                              {/* 3. Dimension */}
                              <TableCell className="text-xs font-semibold text-foreground/80 py-2.5">
                                {item.dimension}
                              </TableCell>

                              {/* 4. Quantity */}
                              <TableCell className="text-center font-black text-xs text-foreground py-2.5">
                                {item.qty}
                              </TableCell>

                              {/* 5. Action Edit & Delete */}
                              <TableCell className="py-2.5">
                                <div className="flex items-center justify-center gap-1.5">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEditCartItem(item)}
                                    className="h-7 w-7 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 active:scale-90 transition-all flex items-center justify-center"
                                    title="Ubah Item"
                                  >
                                    <LuPencil size={13} />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      handleRemoveCartItem(item.id)
                                    }
                                    className="h-7 w-7 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 active:scale-90 transition-all flex items-center justify-center"
                                    title="Hapus Item"
                                  >
                                    <LuTrash2 size={13} />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={5}
                              className="h-24 text-center text-muted-foreground font-semibold italic text-xs py-6"
                            >
                              <LuFileText
                                className="mx-auto text-muted-foreground/60 mb-1.5"
                                size={22}
                              />
                              Belum ada item ditambahkan ke draf.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>

              {/* STRICT ALERT: NO PRICE INCLUDED */}
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-700 dark:text-amber-400 font-semibold leading-relaxed flex items-start gap-2">
                <LuInfo size={16} className="mt-0.5 flex-shrink-0" />
                <span>
                  <strong>PEMBERITAHUAN</strong>: Halaman ini mematuhi regulasi{" "}
                  <em>Strict separation of duties</em>. Informasi harga tidak
                  ditampilkan di monitor desainer.
                </span>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center gap-3 pt-3 border-t border-border/30">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="flex-1 h-11 rounded-xl font-bold"
                  type="button"
                >
                  <LuChevronLeft size={16} className="mr-1" />
                  Kembali
                </Button>
                <Button
                  onClick={handleSubmitTicket}
                  disabled={
                    !customerName.trim() ||
                    cartItems.length === 0 ||
                    saveDraftMutation.isPending
                  }
                  className="flex-1 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-600/10 flex items-center justify-center gap-1.5 active:scale-95 transition-all disabled:opacity-50"
                >
                  {saveDraftMutation.isPending ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                      <span>Mengirim...</span>
                    </>
                  ) : (
                    <>
                      <LuSend size={16} />
                      <span>Simpan Tiket</span>
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateJobEntryPage;

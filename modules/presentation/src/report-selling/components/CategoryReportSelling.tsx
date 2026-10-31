import React, { useState, useMemo } from "react";
import { Card, CardContent } from "@erp-digital-printing/ui/Card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TablePagination,
} from "@erp-digital-printing/ui/Table";
import { TextField } from "@erp-digital-printing/ui/TextField";
import {
  DateRangePicker,
  type DateRange,
} from "@erp-digital-printing/ui/DateRangePicker";
import {
  LuTags,
  LuTag,
  LuDollarSign,
  LuSearch,
  LuShoppingBag,
  LuBoxes,
  LuTrendingUp,
  LuInfo,
  LuSparkles,
} from "@erp-digital-printing/ui/icons";

export interface CategoryProductSale {
  id: string;
  categoryId: string;
  categoryName: string;
  productName: string;
  variantName: string;
  uom: string;
  totalQty: number;
  avgPrice: number;
  totalRevenue: number;
  orderCount: number;
}

export interface CategoryChipItem {
  id: string;
  name: string;
}

const DEFAULT_CATEGORY_CHIPS: CategoryChipItem[] = [
  { id: "all", name: "Semua Kategori" },
  { id: "cat-spanduk", name: "Spanduk & Banner" },
  { id: "cat-sticker", name: "Sticker & Label" },
  { id: "cat-digital-a3", name: "Digital A3+" },
  { id: "cat-merchandise", name: "Merchandise & Souvenir" },
  { id: "cat-tekstil", name: "Tekstil & DTF" },
  { id: "cat-offset", name: "Offset & Dokumen" },
];

const MOCK_CATEGORY_PRODUCTS: CategoryProductSale[] = [
  // Spanduk & Banner
  {
    id: "prod-1",
    categoryId: "cat-spanduk",
    categoryName: "Spanduk & Banner",
    productName: "Flexi China 280g Outdoor",
    variantName: "Standard Glossy",
    uom: "m²",
    totalQty: 642,
    avgPrice: 18000,
    totalRevenue: 11556000,
    orderCount: 124,
  },
  {
    id: "prod-2",
    categoryId: "cat-spanduk",
    categoryName: "Spanduk & Banner",
    productName: "Flexi Korea 380g High Res",
    variantName: "Tebal Doff",
    uom: "m²",
    totalQty: 285,
    avgPrice: 32000,
    totalRevenue: 9120000,
    orderCount: 68,
  },
  {
    id: "prod-3",
    categoryId: "cat-spanduk",
    categoryName: "Spanduk & Banner",
    productName: "X-Banner 60x160cm Lengkap",
    variantName: "Rangka Fiber + Cetak Albatros",
    uom: "Pcs",
    totalQty: 92,
    avgPrice: 65000,
    totalRevenue: 5980000,
    orderCount: 45,
  },
  {
    id: "prod-4",
    categoryId: "cat-spanduk",
    categoryName: "Spanduk & Banner",
    productName: "Roll Up Banner Aluminium 80x200",
    variantName: "Luster Anti Melengkung",
    uom: "Pcs",
    totalQty: 38,
    avgPrice: 185000,
    totalRevenue: 7030000,
    orderCount: 22,
  },

  // Sticker & Label
  {
    id: "prod-5",
    categoryId: "cat-sticker",
    categoryName: "Sticker & Label",
    productName: "Sticker Vinyl Camel Outdoor",
    variantName: "Print & Cut Kiss Cut",
    uom: "m²",
    totalQty: 184,
    avgPrice: 65000,
    totalRevenue: 11960000,
    orderCount: 88,
  },
  {
    id: "prod-6",
    categoryId: "cat-sticker",
    categoryName: "Sticker & Label",
    productName: "Sticker Cromo A3+",
    variantName: "Die Cut / Potong Putus",
    uom: "Lembar",
    totalQty: 850,
    avgPrice: 9500,
    totalRevenue: 8075000,
    orderCount: 112,
  },
  {
    id: "prod-7",
    categoryId: "cat-sticker",
    categoryName: "Sticker & Label",
    productName: "Sticker Transparan A3+",
    variantName: "Tinta White UV Ink",
    uom: "Lembar",
    totalQty: 310,
    avgPrice: 16000,
    totalRevenue: 4960000,
    orderCount: 41,
  },
  {
    id: "prod-8",
    categoryId: "cat-sticker",
    categoryName: "Sticker & Label",
    productName: "Sticker One Way Vision Kaca",
    variantName: "Resolusi UV",
    uom: "m²",
    totalQty: 76,
    avgPrice: 85000,
    totalRevenue: 6460000,
    orderCount: 19,
  },

  // Digital A3+
  {
    id: "prod-9",
    categoryId: "cat-digital-a3",
    categoryName: "Digital A3+",
    productName: "Art Paper 260g Cetak 1 Sisi",
    variantName: "Finishing Laminasi Doff",
    uom: "Lembar",
    totalQty: 1420,
    avgPrice: 4500,
    totalRevenue: 6390000,
    orderCount: 154,
  },
  {
    id: "prod-10",
    categoryId: "cat-digital-a3",
    categoryName: "Digital A3+",
    productName: "Art Carton 310g Cetak 2 Sisi",
    variantName: "Glossy Bolak-balik",
    uom: "Lembar",
    totalQty: 960,
    avgPrice: 7500,
    totalRevenue: 7200000,
    orderCount: 78,
  },
  {
    id: "prod-11",
    categoryId: "cat-digital-a3",
    categoryName: "Digital A3+",
    productName: "Sertifikat Kertas Concorde",
    variantName: "Tekstur Mewah",
    uom: "Lembar",
    totalQty: 420,
    avgPrice: 6000,
    totalRevenue: 2520000,
    orderCount: 33,
  },

  // Merchandise & Souvenir
  {
    id: "prod-12",
    categoryId: "cat-merchandise",
    categoryName: "Merchandise & Souvenir",
    productName: "Mug Keramik Custom Sublim",
    variantName: "Putih Standar SNI + Box",
    uom: "Pcs",
    totalQty: 320,
    avgPrice: 17500,
    totalRevenue: 5600000,
    orderCount: 39,
  },
  {
    id: "prod-13",
    categoryId: "cat-merchandise",
    categoryName: "Merchandise & Souvenir",
    productName: "Gantungan Kunci Akrilik 2 Sisi",
    variantName: "Ketebalan 3mm Laser Cut",
    uom: "Pcs",
    totalQty: 540,
    avgPrice: 7000,
    totalRevenue: 3780000,
    orderCount: 26,
  },
  {
    id: "prod-14",
    categoryId: "cat-merchandise",
    categoryName: "Merchandise & Souvenir",
    productName: "Tumbler Stainless Grafir Laser",
    variantName: "Termos Suhu LED 500ml",
    uom: "Pcs",
    totalQty: 85,
    avgPrice: 48000,
    totalRevenue: 4080000,
    orderCount: 14,
  },

  // Tekstil & Sablon DTF
  {
    id: "prod-15",
    categoryId: "cat-tekstil",
    categoryName: "Tekstil & DTF",
    productName: "Print DTF Sablon Meteran",
    variantName: "Tinta Premium Lem Halus",
    uom: "m_lari",
    totalQty: 215,
    avgPrice: 50000,
    totalRevenue: 10750000,
    orderCount: 62,
  },
  {
    id: "prod-16",
    categoryId: "cat-tekstil",
    categoryName: "Tekstil & DTF",
    productName: "Kaos Combed 30s + Sablon DTF A3",
    variantName: "Ready Stock Hitam/Putih",
    uom: "Pcs",
    totalQty: 110,
    avgPrice: 68000,
    totalRevenue: 7480000,
    orderCount: 34,
  },

  // Offset & Dokumen
  {
    id: "prod-17",
    categoryId: "cat-offset",
    categoryName: "Offset & Dokumen",
    productName: "Brosur Art Paper 150g A4 Lipat 3",
    variantName: "Full Color Cetak Separasi Offset",
    uom: "Rim",
    totalQty: 24,
    avgPrice: 380000,
    totalRevenue: 9120000,
    orderCount: 18,
  },
  {
    id: "prod-18",
    categoryId: "cat-offset",
    categoryName: "Offset & Dokumen",
    productName: "Nota / Surat Jalan NCR 3 Ply",
    variantName: "Cetak 1 Warna Nomorator Porporasi",
    uom: "Buku",
    totalQty: 180,
    avgPrice: 22000,
    totalRevenue: 3960000,
    orderCount: 21,
  },
];

interface CategoryReportSellingProps {
  formatCurrency: (value: number) => string;
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  availableCategories?: CategoryChipItem[];
  dateRange?: DateRange;
  setDateRange?: (range: DateRange | undefined) => void;
}

export const CategoryReportSelling: React.FC<CategoryReportSellingProps> = ({
  formatCurrency,
  selectedCategory,
  onSelectCategory,
  availableCategories = DEFAULT_CATEGORY_CHIPS,
  dateRange,
  setDateRange,
}) => {
  const [productSearch, setProductSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [prevCategory, setPrevCategory] = useState(selectedCategory);

  // Reset page when category changes from props without cascading effect
  if (prevCategory !== selectedCategory) {
    setPrevCategory(selectedCategory);
    setPage(1);
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProductSearch(e.target.value);
    setPage(1);
  };

  const handleCategoryClick = (categoryId: string) => {
    onSelectCategory(categoryId);
    setPage(1);
  };

  // Filter items by category chip selection
  const categoryFilteredItems = useMemo(() => {
    if (selectedCategory === "all") {
      return MOCK_CATEGORY_PRODUCTS;
    }
    return MOCK_CATEGORY_PRODUCTS.filter(
      (item) => item.categoryId === selectedCategory
    );
  }, [selectedCategory]);

  // Secondary search filter by product / variant name
  const finalDisplayItems = useMemo(() => {
    if (!productSearch.trim()) {
      return categoryFilteredItems;
    }
    const q = productSearch.toLowerCase();
    return categoryFilteredItems.filter(
      (item) =>
        item.productName.toLowerCase().includes(q) ||
        item.variantName.toLowerCase().includes(q) ||
        item.categoryName.toLowerCase().includes(q)
    );
  }, [categoryFilteredItems, productSearch]);

  // Pagination slicing
  const totalEntries = finalDisplayItems.length;
  const totalPages = Math.ceil(totalEntries / pageSize) || 1;
  const paginatedItems = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return finalDisplayItems.slice(startIndex, startIndex + pageSize);
  }, [finalDisplayItems, page, pageSize]);

  // Aggregate KPIs based on selected category
  const categoryStats = useMemo(() => {
    const totalRevenue = categoryFilteredItems.reduce(
      (acc, item) => acc + item.totalRevenue,
      0
    );
    const totalQty = categoryFilteredItems.reduce(
      (acc, item) => acc + item.totalQty,
      0
    );
    const totalTransactions = categoryFilteredItems.reduce(
      (acc, item) => acc + item.orderCount,
      0
    );
    const productCount = categoryFilteredItems.length;

    return {
      totalRevenue,
      totalQty,
      totalTransactions,
      productCount,
    };
  }, [categoryFilteredItems]);

  const activeCategoryLabel = useMemo(() => {
    const found = availableCategories.find((c) => c.id === selectedCategory);
    return found ? found.name : "Kategori Produk";
  }, [selectedCategory, availableCategories]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
      {/* Category Filter Chips & Date Range Card */}
      <div className="bg-card border border-border/50 p-5 rounded-3xl shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <LuTags size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-foreground">
                  Filter Kategori Produk
                </h3>
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 flex items-center gap-1">
                  <LuSparkles size={10} />
                  Preview Mock
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Pilih kategori dan rentang tanggal untuk melihat performa penjualan spesifik produk
              </p>
            </div>
          </div>

          {setDateRange && (
            <div className="flex items-center gap-2 w-full md:w-auto">
              <DateRangePicker
                value={dateRange}
                onChange={setDateRange}
                className="w-full sm:w-[260px] h-10"
              />
            </div>
          )}
        </div>

        {/* Flex Wrap Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {availableCategories.map((chip) => {
            const isActive = selectedCategory === chip.id;
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => handleCategoryClick(chip.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                  isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20 scale-[1.02]"
                    : "bg-muted/40 hover:bg-muted/80 text-muted-foreground hover:text-foreground border-border/40"
                }`}
              >
                <LuTag
                  size={13}
                  className={
                    isActive ? "text-primary-foreground" : "text-muted-foreground"
                  }
                />
                <span>{chip.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Category KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Omset Kategori */}
        <Card className="rounded-2xl border-border/50 shadow-sm relative overflow-hidden bg-card">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Omset ({activeCategoryLabel})
              </span>
              <div className="text-lg font-black tracking-tight text-foreground">
                {formatCurrency(categoryStats.totalRevenue)}
              </div>
            </div>
            <div className="p-3 bg-primary/10 rounded-2xl text-primary">
              <LuDollarSign size={22} />
            </div>
          </CardContent>
        </Card>

        {/* Total Volume Qty */}
        <Card className="rounded-2xl border-border/50 shadow-sm relative overflow-hidden bg-card">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Total Volume Produk
              </span>
              <div className="text-lg font-black tracking-tight text-foreground">
                {categoryStats.totalQty.toLocaleString("id-ID")}{" "}
                <span className="text-xs font-bold text-muted-foreground">Qty</span>
              </div>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-600 dark:text-emerald-400">
              <LuShoppingBag size={22} />
            </div>
          </CardContent>
        </Card>

        {/* Total Transaksi */}
        <Card className="rounded-2xl border-border/50 shadow-sm relative overflow-hidden bg-card">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Frekuensi Pesanan
              </span>
              <div className="text-lg font-black tracking-tight text-foreground">
                {categoryStats.totalTransactions}{" "}
                <span className="text-xs font-bold text-muted-foreground">Transaksi</span>
              </div>
            </div>
            <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-600 dark:text-indigo-400">
              <LuBoxes size={22} />
            </div>
          </CardContent>
        </Card>

        {/* Varian / Produk Aktif */}
        <Card className="rounded-2xl border-border/50 shadow-sm relative overflow-hidden bg-card">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Produk / Varian Terdata
              </span>
              <div className="text-lg font-black tracking-tight text-foreground">
                {categoryStats.productCount}{" "}
                <span className="text-xs font-bold text-muted-foreground">Item SKU</span>
              </div>
            </div>
            <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-600 dark:text-amber-400">
              <LuTrendingUp size={22} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Breakdown Products Table */}
      <Card className="rounded-3xl border-border/50 shadow-sm overflow-hidden bg-card">
        {/* Table Search Header */}
        <div className="p-5 border-b border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h3 className="text-base font-bold text-foreground">
              Rincian Penjualan Produk & Varian
            </h3>
            <p className="text-xs text-muted-foreground">
              Daftar performa penjualan item berdasarkan kategori{" "}
              <strong className="text-foreground">{activeCategoryLabel}</strong>
            </p>
          </div>
          <div className="w-full sm:w-[280px]">
            <TextField
              placeholder="Cari nama produk / varian..."
              prefixIcon={LuSearch}
              value={productSearch}
              onChange={handleSearchChange}
              className="w-full h-10"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 border-b border-border/30 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                <TableHead className="py-4 px-5 text-center w-12">No</TableHead>
                <TableHead className="py-4 px-5 min-w-[220px]">Produk & Spesifikasi</TableHead>
                <TableHead className="py-4 px-5 min-w-[150px]">Kategori</TableHead>
                <TableHead className="py-4 px-5 text-center">Satuan</TableHead>
                <TableHead className="py-4 px-5 text-right min-w-[110px]">Volume Terjual</TableHead>
                <TableHead className="py-4 px-5 text-right min-w-[130px]">Harga Satuan (Avg)</TableHead>
                <TableHead className="py-4 px-5 text-right min-w-[140px]">Total Omset</TableHead>
                <TableHead className="py-4 px-5 text-center min-w-[110px]">Frekuensi Order</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border/20 text-xs font-semibold text-foreground">
              {finalDisplayItems.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="py-12 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <LuInfo size={28} className="text-muted-foreground/60" />
                      <p className="text-sm font-semibold">
                        Tidak ada data produk ditemukan pada kategori ini
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Coba pilih kategori lain atau ubah kata kunci pencarian.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedItems.map((item, index) => (
                  <TableRow
                    key={item.id}
                    className="hover:bg-muted/20 transition-colors"
                  >
                    <TableCell className="py-4 px-5 text-center font-mono font-bold text-muted-foreground">
                      {(page - 1) * pageSize + index + 1}
                    </TableCell>
                    <TableCell className="py-4 px-5">
                      <div className="space-y-0.5">
                        <span className="font-bold text-foreground text-xs block">
                          {item.productName}
                        </span>
                        <span className="text-[11px] text-muted-foreground font-medium block">
                          Varian: {item.variantName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                        {item.categoryName}
                      </span>
                    </TableCell>
                    <TableCell className="py-4 px-5 text-center">
                      <span className="font-mono text-xs font-bold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded border border-border/50">
                        {item.uom}
                      </span>
                    </TableCell>
                    <TableCell className="py-4 px-5 text-right font-black text-foreground">
                      {item.totalQty.toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell className="py-4 px-5 text-right font-mono font-bold text-muted-foreground">
                      {formatCurrency(item.avgPrice)}
                    </TableCell>
                    <TableCell className="py-4 px-5 text-right font-black text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(item.totalRevenue)}
                    </TableCell>
                    <TableCell className="py-4 px-5 text-center">
                      <span className="font-bold text-xs text-foreground bg-muted/40 px-2 py-1 rounded-md">
                        {item.orderCount} Nota
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Dynamic Pagination UI (Identical to Invoice Feature) */}
        <TablePagination
          currentPage={page}
          totalPages={totalPages}
          pageSize={pageSize}
          totalEntries={totalEntries}
          onPageChange={(p) => setPage(p)}
          onPageSizeChange={(sz) => {
            setPageSize(sz);
            setPage(1);
          }}
        />
      </Card>
    </div>
  );
};


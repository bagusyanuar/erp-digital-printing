import React, { useState, useMemo, useEffect } from "react";
import { Button } from "@erp-digital-printing/ui/Button";
import { TextField } from "@erp-digital-printing/ui/TextField";
import { Card, CardHeader, CardContent } from "@erp-digital-printing/ui/Card";
import { Dialog } from "@erp-digital-printing/ui/Dialog";
import { TablePagination } from "@erp-digital-printing/ui/Table";
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
} from "@erp-digital-printing/ui/Dropdown";
import { toast } from "@erp-digital-printing/ui/Toast";
import {
  LuSearch,
  LuFilter,
  LuUser,
  LuCalendar,
  LuShoppingBag,
  LuCreditCard,
  LuReceipt,
  LuCheck,
  LuPrinter,
  LuClock,
  LuInfo,
  LuSparkles,
  LuCoins,
  LuArrowRight,
  LuTrendingUp,
  LuChevronRight,
  LuDollarSign,
  LuEllipsisVertical,
  LuScissors,
} from "@erp-digital-printing/ui/icons";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useOrderDI } from "@presentation/order/hooks/useOrderDI";
import { orderKeys } from "@infrastructure/order/keys";
import type { AppError } from "@core/shared/errors/domain.error";
import type {
  OrderModel,
  OrderSpkModel,
  OrderPaymentModel,
} from "@core/order/domains/models/order.model";
import type { PaginatedResponse } from "@core/shared/api/pagination";
import type { ProcessPaymentInput, RepayPaymentInput } from "@core/order/domains/repositories/order.repository";

// Interfaces for mapped presentation UI
interface InvoiceItem {
  id: string;
  productName: string;
  qty: number;
  pricePerUnit: number;
  subtotal: number;
  notes?: string;
}

interface Invoice {
  id: string;
  invoiceNo: string;
  jobNumber: string;
  customerName: string;
  customerPhone: string;
  isReseller: boolean;
  createdAt: string;
  items: InvoiceItem[];
  paymentMethod?: string;
  totalAmount: number;
  amountPaid: number;
  status: "PAID" | "PARTIAL" | "UNPAID";
}

const InvoicePage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PAID" | "UNPAID">(
    "ALL",
  );

  // Pagination states
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Selection states for Dialogs
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isPayOpen, setIsPayOpen] = useState(false);
  const [isSpkOpen, setIsSpkOpen] = useState(false);
  const [selectedSpkCategory, setSelectedSpkCategory] = useState<string | null>(
    null,
  );
  const [isSpkPreviewOpen, setIsSpkPreviewOpen] = useState(false);

  // Quick Payment form states
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<string>("CASH");

  const { getOrdersUseCase, repayOrderUseCase, getOrderPaymentsUseCase, getOrderSpkUseCase } =
    useOrderDI();

  // Fetch SPK from backend when the modal is open
  const { data: spkResponse, isLoading: isLoadingSpk } = useQuery<
    OrderSpkModel,
    AppError
  >({
    queryKey: orderKeys.spk(selectedInvoice?.id ?? ""),
    queryFn: () => getOrderSpkUseCase.execute(selectedInvoice!.id),
    enabled: isSpkOpen && !!selectedInvoice?.id,
    staleTime: 5000,
    refetchOnWindowFocus: false,
  });

  // Fetch Payment History from backend when the detail modal is open
  const { data: payments, isLoading: isLoadingPayments } = useQuery<
    OrderPaymentModel[],
    AppError
  >({
    queryKey: orderKeys.payments(selectedInvoice?.id ?? ""),
    queryFn: () => getOrderPaymentsUseCase.execute(selectedInvoice!.id),
    enabled: isDetailOpen && !!selectedInvoice?.id,
    staleTime: 5000,
    refetchOnWindowFocus: false,
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Map presentation statusFilter to API payment_status query parameter
  const mappedPaymentStatus = useMemo(() => {
    if (statusFilter === "PAID") return "PAID";
    if (statusFilter === "UNPAID") return "PARTIAL_PAID,UNPAID";
    return undefined; // ALL
  }, [statusFilter]);

  // Fetch real order data from backend API with dynamic pagination
  const {
    data: response,
    isLoading,
    refetch,
  } = useQuery<PaginatedResponse<OrderModel>, AppError>({
    queryKey: orderKeys.list({
      page,
      limit: pageSize,
      status: "IN_PRODUCTION,READY_FOR_PICKUP,COMPLETED",
      payment_status: mappedPaymentStatus,
    }),
    queryFn: () =>
      getOrdersUseCase.execute({
        page,
        limit: pageSize,
        status: "IN_PRODUCTION,READY_FOR_PICKUP,COMPLETED",
        payment_status: mappedPaymentStatus,
      }),
    staleTime: 5000,
    gcTime: 15_000,
    refetchOnWindowFocus: false,
  });

  // Purely computed invoices state from API response
  const invoices = useMemo((): Invoice[] => {
    return (response?.data ?? []).map((order): Invoice => {
      // Format backend date to localized Indonesian date
      let formattedDate = order.created_at;
      try {
        formattedDate = new Date(order.created_at).toLocaleString("id-ID", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        });
      } catch (e) {
        // Fallback
      }

      return {
        id: order.id,
        invoiceNo: order.invoice_number || order.job_number,
        jobNumber: order.job_number,
        customerName: order.customer_name || "Customer Walk In",
        customerPhone: order.customer_phone || "-",
        isReseller: !!order.reseller_id,
        createdAt: formattedDate,
        items: (order.order_items ?? []).map((item) => ({
          id: item.id,
          productName: item.variant_name
            ? `${item.product_name} (${item.variant_name})`
            : item.product_name,
          qty: item.quantity,
          pricePerUnit: item.price_per_unit || 0,
          subtotal: item.subtotal || 0,
          notes: item.production_notes || "-",
        })),
        totalAmount: order.grand_total || 0,
        amountPaid: order.amount_paid || 0,
        status:
          order.payment_status === "PAID"
            ? "PAID"
            : order.payment_status === "PARTIAL_PAID"
              ? "PARTIAL"
              : "UNPAID",
      };
    });
  }, [response]);

  // Get active items for the selected SPK category from backend data
  const activeSpkCategoryItems = useMemo(() => {
    if (!spkResponse || !selectedSpkCategory) return [];
    const cat = spkResponse.spk_by_category.find(
      (c) => c.category_name === selectedSpkCategory,
    );
    return cat ? cat.items : [];
  }, [spkResponse, selectedSpkCategory]);

  // Filter dynamic search query on top of fetched items
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const query = searchQuery.toLowerCase();
      return (
        inv.invoiceNo.toLowerCase().includes(query) ||
        inv.customerName.toLowerCase().includes(query) ||
        inv.jobNumber.toLowerCase().includes(query)
      );
    });
  }, [invoices, searchQuery]);

  // Statistics Computations
  const stats = useMemo(() => {
    const totalCount = invoices.length;
    const paidCount = invoices.filter((i) => i.status === "PAID").length;
    const unpaidCount = invoices.filter((i) => i.status !== "PAID").length;
    const totalReceivable = invoices.reduce(
      (sum, i) => sum + (i.totalAmount - i.amountPaid),
      0,
    );
    const totalCollected = invoices.reduce((sum, i) => sum + i.amountPaid, 0);

    // Total Penjualan: Lunas + Piutang (Grand Total of all invoices)
    const totalSales = invoices.reduce((sum, i) => sum + i.totalAmount, 0);

    // Total Pendapatan: Hanya transaksi yang lunas saja
    const totalRevenue = invoices
      .filter((i) => i.status === "PAID")
      .reduce((sum, i) => sum + i.totalAmount, 0);

    return {
      totalCount,
      paidCount,
      unpaidCount,
      totalReceivable,
      totalCollected,
      totalSales,
      totalRevenue,
    };
  }, [invoices]);

  const handleOpenPay = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setPayAmount(invoice.totalAmount - invoice.amountPaid);
    setPayMethod("CASH");
    setIsPayOpen(true);
  };

  // Mutation to process quick payment (pelunasan) in backend
  const processPaymentMutation = useMutation<
    void,
    AppError,
    { id: string; payload: RepayPaymentInput }
  >({
    mutationFn: ({ id, payload }) => repayOrderUseCase.execute(id, payload),
    onSuccess: () => {
      refetch();
      setIsPayOpen(false);
      toast.success(
        "Pelunasan Berhasil",
        `Pembayaran pelunasan untuk nota ${selectedInvoice?.invoiceNo} berhasil disimpan.`,
      );
    },
    onError: (error) => {
      toast.error(
        "Pelunasan Gagal",
        error.message ||
          "Terjadi kesalahan saat memproses pelunasan di server.",
      );
    },
  });

  const handleProcessPayment = () => {
    if (!selectedInvoice) return;

    if (payAmount <= 0) {
      toast.error(
        "Nominal pelunasan tidak valid",
        "Jumlah bayar harus lebih besar dari 0.",
      );
      return;
    }

    const outstanding =
      selectedInvoice.totalAmount - selectedInvoice.amountPaid;
    if (payAmount > outstanding) {
      toast.error(
        "Nominal berlebih",
        `Jumlah pembayaran melebihi sisa tagihan (${formatCurrency(outstanding)}).`,
      );
      return;
    }

    const payload: RepayPaymentInput = {
      payment_method: payMethod.toLowerCase(),
      amount_paid: payAmount,
    };

    processPaymentMutation.mutate({
      id: selectedInvoice.id,
      payload,
    });
  };

  const handlePrintInvoice = (invoiceNo: string) => {
    toast.success(
      "Cetak Antrean",
      `Mengirim perintah print untuk nota ${invoiceNo} ke printer kasir.`,
    );
  };

  const handlePrintSpk = (category: string) => {
    setSelectedSpkCategory(category);
    setIsSpkPreviewOpen(true);
  };

  const handlePrintAllSpk = () => {
    toast.success(
      "Rilis Semua SPK",
      `Berhasil merilis ${spkResponse?.spk_by_category.length || 0} SPK terpisah untuk masing-masing divisi produksi.`,
    );
    setIsSpkOpen(false);
  };

  return (
    <div className="p-6 space-y-6 font-sans bg-background min-h-screen animate-in fade-in duration-500">
      {/* Header Panel */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border/30 pb-5">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
            <LuReceipt className="text-primary animate-pulse" size={32} />
            Kelola Invoice & Piutang
          </h1>
          <p className="text-muted-foreground font-medium text-sm">
            Pantau pembayaran nota lunas/tempo, kelola pelunasan cicilan, dan
            cetak ulang nota kasir.
          </p>
        </div>

        {/* Action button */}
        <div className="flex gap-2 shrink-0">
          <Button
            variant="outline"
            className="rounded-xl font-bold text-xs flex items-center gap-2 border-border/60"
            onClick={() =>
              toast.success(
                "Ekspor Data",
                "Mengekspor laporan invoice ke Excel.",
              )
            }
          >
            Ekspor Laporan
          </Button>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat Total Sales (Lunas + Piutang) */}
        <Card className="rounded-2xl border border-border/40 bg-card overflow-hidden">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-2xl">
              <LuShoppingBag size={22} />
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground uppercase font-black tracking-wider block">
                Total Penjualan
              </span>
              <span className="text-xl font-black text-foreground">
                {formatCurrency(stats.totalSales)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Stat Revenue (Lunas Only) */}
        <Card className="rounded-2xl border border-border/40 bg-card overflow-hidden">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl">
              <LuTrendingUp size={22} />
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground uppercase font-black tracking-wider block">
                Total Pendapatan (Lunas)
              </span>
              <span className="text-xl font-black text-foreground">
                {formatCurrency(stats.totalRevenue)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Stat Receivables */}
        <Card className="rounded-2xl border border-border/40 bg-card overflow-hidden">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-2xl">
              <LuCoins size={22} />
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground uppercase font-black tracking-wider block">
                Total Piutang Belum Lunas
              </span>
              <span className="text-xl font-black text-rose-600 dark:text-rose-400">
                {formatCurrency(stats.totalReceivable)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Stat Unpaid Total */}
        <Card className="rounded-2xl border border-border/40 bg-card overflow-hidden">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-2xl">
              <LuClock size={22} />
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground uppercase font-black tracking-wider block">
                Invoice Belum Lunas
              </span>
              <span className="text-xl font-black text-red-600">
                {stats.unpaidCount} Transaksi
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-card border border-border/40 p-4 rounded-2xl space-y-4 shadow-sm">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Quick Search */}
          <div className="w-full lg:w-96">
            <TextField
              placeholder="Cari No. Invoice, Job, atau Pelanggan..."
              prefixIcon={LuSearch}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full"
            />
          </div>

          {/* Quick Status Filters (Pills) */}
          <div className="flex gap-2 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            {(
              [
                { id: "ALL", label: "Semua Invoice" },
                { id: "PAID", label: "Lunas" },
                { id: "UNPAID", label: "Belum Lunas" },
              ] as const
            ).map((tab) => {
              const isActive = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setStatusFilter(tab.id);
                    setPage(1);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all duration-200 shrink-0 border ${
                    isActive
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-background text-muted-foreground border-border hover:bg-muted"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Table / Grid */}
      <Card className="border border-border/40 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/40 border-b border-border/30 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                <th className="py-4 px-5">No. Nota</th>
                <th className="py-4 px-5">Pelanggan</th>
                <th className="py-4 px-5">Tanggal</th>
                <th className="py-4 px-5 text-right">Total Tagihan</th>
                <th className="py-4 px-5 text-right">Telah Dibayar</th>
                <th className="py-4 px-5 text-right">Sisa Piutang</th>
                <th className="py-4 px-5 text-center">Status</th>
                <th className="py-4 px-5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20 text-xs font-semibold text-foreground">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center space-y-3">
                    <div className="relative w-8 h-8 mx-auto">
                      <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
                      <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    </div>
                    <span className="text-xs font-bold text-muted-foreground block">
                      Memuat Data Invoice...
                    </span>
                  </td>
                </tr>
              ) : filteredInvoices.length > 0 ? (
                filteredInvoices.map((inv) => {
                  const outstanding = inv.totalAmount - inv.amountPaid;

                  return (
                    <tr
                      key={inv.id}
                      className="hover:bg-muted/20 transition-colors duration-150"
                    >
                      {/* Invoice & Job No */}
                      <td className="py-4 px-5 space-y-1">
                        <div className="font-mono font-bold text-foreground bg-muted px-2 py-0.5 rounded-lg border border-border/50 inline-block">
                          {inv.invoiceNo}
                        </div>
                        <div className="text-[10px] text-muted-foreground font-semibold block">
                          No. Tiket / Job: {inv.jobNumber}
                        </div>
                      </td>

                      {/* Customer Info */}
                      <td className="py-4 px-5 space-y-1">
                        <div className="font-bold flex items-center gap-1.5">
                          <LuUser size={13} className="text-primary/70" />
                          {inv.customerName}
                        </div>
                        <span
                          className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border leading-none ${
                            inv.isReseller
                              ? "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-900/50"
                              : "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/30 dark:text-slate-400 dark:border-slate-800/50"
                          }`}
                        >
                          {inv.isReseller ? "Biro / Reseller" : "Retail"}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-5">
                        <div className="text-muted-foreground flex items-center gap-1">
                          <LuCalendar size={12} />
                          {inv.createdAt}
                        </div>
                      </td>

                      {/* Total Amount */}
                      <td className="py-4 px-5 text-right font-black text-foreground">
                        {formatCurrency(inv.totalAmount)}
                      </td>

                      {/* Amount Paid */}
                      <td className="py-4 px-5 text-right font-black text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(inv.amountPaid)}
                      </td>

                      {/* Sisa Piutang */}
                      <td className="py-4 px-5 text-right font-black">
                        {outstanding > 0 ? (
                          <span className="text-rose-500">
                            {formatCurrency(outstanding)}
                          </span>
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400">
                            -
                          </span>
                        )}
                      </td>

                      {/* Payment Status Badge */}
                      <td className="py-4 px-5 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border leading-none ${
                            inv.status === "PAID"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50"
                              : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50"
                          }`}
                        >
                          {inv.status === "PAID" ? "Lunas" : "Belum Lunas"}
                        </span>
                      </td>

                      {/* Dropdown Popover Actions */}
                      <td className="py-4 px-5 text-center">
                        <div className="flex items-center justify-center">
                          <Dropdown>
                            <DropdownTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-lg hover:bg-muted/70 active:scale-95 transition-all"
                              >
                                <LuEllipsisVertical className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            </DropdownTrigger>
                            <DropdownContent align="end" className="w-44">
                              <DropdownItem
                                onClick={() => {
                                  setSelectedInvoice(inv);
                                  setIsDetailOpen(true);
                                }}
                              >
                                <LuReceipt className="h-3.5 w-3.5 text-primary" />
                                <span>Detail Rincian</span>
                              </DropdownItem>
                              <DropdownItem
                                onClick={() =>
                                  handlePrintInvoice(inv.invoiceNo)
                                }
                              >
                                <LuPrinter className="h-3.5 w-3.5 text-muted-foreground" />
                                <span>Cetak Ulang Struk</span>
                              </DropdownItem>
                              <DropdownItem
                                onClick={() => {
                                  setSelectedInvoice(inv);
                                  setIsSpkOpen(true);
                                }}
                              >
                                <LuScissors className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                                <span>Cetak SPK (Kerja)</span>
                              </DropdownItem>
                              {inv.status !== "PAID" && (
                                <DropdownItem
                                  onClick={() => handleOpenPay(inv)}
                                >
                                  <LuCoins className="h-3.5 w-3.5 text-emerald-600" />
                                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                                    Bayar Pelunasan
                                  </span>
                                </DropdownItem>
                              )}
                            </DropdownContent>
                          </Dropdown>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 px-5 text-center space-y-3">
                    <LuInfo
                      size={36}
                      className="text-muted-foreground/60 mx-auto"
                    />
                    <h3 className="font-bold text-foreground text-sm">
                      Tidak Ada Data Invoice
                    </h3>
                    <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                      Tidak ada invoice yang cocok dengan kriteria filter
                      pencarian atau status saat ini.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Dynamic Server Pagination UI */}
        <TablePagination
          currentPage={page}
          totalPages={Math.ceil((response?.total ?? 0) / pageSize)}
          pageSize={pageSize}
          totalEntries={response?.total ?? 0}
          onPageChange={(p) => setPage(p)}
          onPageSizeChange={(sz) => {
            setPageSize(sz);
            setPage(1);
          }}
        />
      </Card>

      <Dialog
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        className="rounded-3xl p-6 bg-card border border-border/50 text-foreground overflow-hidden max-h-[90vh] flex flex-col"
        showCloseButton={true}
      >
        {selectedInvoice && (
          <div className="space-y-5 flex flex-col overflow-hidden h-[75vh] max-h-[75vh]">
            {/* Dialog Header */}
            <div className="flex flex-col gap-1 border-b border-border/30 pb-4 shrink-0">
              <h2 className="text-xl font-black tracking-tight text-foreground flex items-center gap-2">
                <LuReceipt size={20} className="text-primary" />
                Detail Rincian Belanja Nota
              </h2>
            </div>

            {/* Scrollable Body Content */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-5 scrollbar-thin">
              {/* Header info */}
              <div className="grid grid-cols-2 gap-4 bg-muted/30 p-3.5 rounded-xl border border-border/40">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase">
                    Nomor Invoice
                  </span>
                  <span className="font-mono font-black text-foreground text-xs block">
                    {selectedInvoice.invoiceNo}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase">
                    Pelanggan
                  </span>
                  <span className="font-bold text-foreground text-xs block">
                    {selectedInvoice.customerName}
                  </span>
                </div>
              </div>

              {/* Item list */}
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block">
                  Daftar Item Cetak
                </span>
                <div className="border border-border/40 rounded-xl overflow-hidden divide-y divide-border/20">
                  {selectedInvoice.items.map((item, idx) => (
                    <div
                      key={item.id}
                      className="p-3 bg-card flex justify-between gap-4 text-xs font-semibold"
                    >
                      <div>
                        <span className="text-foreground block">
                          {idx + 1}. {item.productName}
                        </span>
                        {item.notes && (
                          <span className="text-[10px] text-muted-foreground block font-medium mt-0.5">
                            Finishing: {item.notes}
                          </span>
                        )}
                        <span className="text-[10px] text-primary font-bold block mt-1">
                          {formatCurrency(item.pricePerUnit)} x {item.qty} Qty
                        </span>
                      </div>
                      <span className="font-black text-foreground shrink-0 self-center">
                        {formatCurrency(item.subtotal)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Riwayat Pembayaran (Dynamic Timeline UI) */}
              <div className="space-y-2.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block">
                  Riwayat Pembayaran
                </span>
                <div className="bg-muted/15 border border-border/40 rounded-2xl p-4 max-h-[180px] overflow-y-auto scrollbar-thin">
                  {isLoadingPayments ? (
                    <div className="flex flex-col items-center justify-center py-6 space-y-2">
                      <div className="relative w-6 h-6">
                        <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
                        <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                      </div>
                      <span className="text-[10px] font-bold text-muted-foreground">
                        Memuat Riwayat Pembayaran...
                      </span>
                    </div>
                  ) : payments && payments.length > 0 ? (
                    <div className="relative border-l border-border pl-4 space-y-4">
                      {payments.map((pay, idx) => (
                        <div key={pay.id} className="relative">
                          {/* Circle Indicator */}
                          <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100 dark:ring-emerald-950/40" />
                          <div className="flex justify-between items-start gap-4 text-xs font-semibold">
                            <div>
                              <span className="text-foreground font-black block">
                                {idx === 0 ? "Pembayaran Awal" : `Cicilan Pelunasan #${idx}`}
                              </span>
                              <span className="text-[10px] text-muted-foreground font-medium block mt-0.5">
                                {pay.created_at} • {pay.payment_method.toUpperCase()} • Kasir: {pay.cashier_name}
                              </span>
                            </div>
                            <span className="font-black text-emerald-600 dark:text-emerald-400 shrink-0">
                              {formatCurrency(pay.amount)}
                            </span>
                          </div>
                        </div>
                      ))}

                      {/* If outstanding balance exists, show warning dot/installment step */}
                      {selectedInvoice.totalAmount - selectedInvoice.amountPaid > 0 && (
                        <div className="relative">
                          {/* Orange Indicator for unpaid remaining */}
                          <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-4 ring-amber-100 dark:ring-amber-950/40 animate-pulse" />
                          <div className="flex justify-between items-start gap-4 text-xs font-semibold">
                            <div>
                              <span className="text-amber-600 dark:text-amber-400 font-black block">
                                Sisa Tagihan Belum Lunas (Piutang)
                              </span>
                              <span className="text-[10px] text-muted-foreground font-medium block mt-0.5">
                                Menunggu pelunasan
                              </span>
                            </div>
                            <span className="font-black text-rose-500 shrink-0">
                              {formatCurrency(
                                selectedInvoice.totalAmount - selectedInvoice.amountPaid,
                              )}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-6 space-y-1">
                      <span className="text-xs font-bold text-muted-foreground block">
                        Belum ada riwayat pembayaran
                      </span>
                      <span className="text-[10px] text-muted-foreground block font-medium">
                        Transaksi ini berstatus piutang tanpa pembayaran awal.
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Subtotals & Payment summary */}
              <div className="border-t border-border/20 pt-4 space-y-2 text-xs font-semibold">
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Total Belanja</span>
                  <span className="font-bold text-foreground">
                    {formatCurrency(selectedInvoice.totalAmount)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400">
                  <span>Jumlah Telah Terbayar</span>
                  <span className="font-black">
                    {formatCurrency(selectedInvoice.amountPaid)}
                  </span>
                </div>
                <div className="flex justify-between items-center border-t border-dashed border-border/30 pt-2 font-black">
                  <span className="text-primary uppercase tracking-wider text-[10px]">
                    Sisa Tagihan
                  </span>
                  <span className="text-sm text-rose-500">
                    {formatCurrency(
                      selectedInvoice.totalAmount - selectedInvoice.amountPaid,
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-2.5 border-t border-border/20 pt-4 shrink-0">
              <Button
                variant="outline"
                className="rounded-xl text-xs font-bold px-4 border-border/50"
                onClick={() => setIsDetailOpen(false)}
              >
                Tutup
              </Button>
              <Button
                className="rounded-xl text-xs font-black px-4 bg-primary text-primary-foreground flex items-center gap-1.5"
                onClick={() => {
                  setIsDetailOpen(false);
                  handlePrintInvoice(selectedInvoice.invoiceNo);
                }}
              >
                <LuPrinter size={13} />
                Cetak Struk
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* DIALOG 2: Quick Collect Payment Dialog */}
      <Dialog
        isOpen={isPayOpen}
        onClose={() => setIsPayOpen(false)}
        className="rounded-3xl p-6 bg-card border border-border/50 text-foreground overflow-hidden max-h-[90vh] flex flex-col"
        showCloseButton={true}
      >
        {selectedInvoice && (
          <div className="space-y-5 flex flex-col overflow-hidden">
            {/* Dialog Header */}
            <div className="flex flex-col gap-1 border-b border-border/30 pb-4">
              <h2 className="text-xl font-black tracking-tight text-foreground flex items-center gap-2">
                <LuCoins size={20} className="text-primary" />
                Input Pelunasan Tagihan / Piutang
              </h2>
            </div>

            {/* Short info */}
            <div className="bg-primary/5 dark:bg-primary/10 p-4 rounded-2xl border border-primary/15 space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase text-muted-foreground">
                  Nomor Nota
                </span>
                <span className="font-mono font-black text-xs text-foreground">
                  {selectedInvoice.invoiceNo}
                </span>
              </div>
              <div className="flex justify-between items-center font-bold text-xs">
                <span className="text-muted-foreground">Pelanggan:</span>
                <span className="text-foreground">
                  {selectedInvoice.customerName}
                </span>
              </div>
              <div className="flex justify-between items-center font-black text-xs pt-1.5 border-t border-primary/10">
                <span className="text-rose-600 dark:text-rose-400">
                  Sisa Tagihan (Piutang):
                </span>
                <span className="text-rose-600 dark:text-rose-400">
                  {formatCurrency(
                    selectedInvoice.totalAmount - selectedInvoice.amountPaid,
                  )}
                </span>
              </div>
            </div>

            {/* Input field */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">
                Jumlah Pembayaran (Pelunasan)
              </span>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-xs text-muted-foreground">
                  Rp
                </span>
                <input
                  type="number"
                  min="1"
                  max={selectedInvoice.totalAmount - selectedInvoice.amountPaid}
                  value={payAmount || ""}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    const outstanding =
                      selectedInvoice.totalAmount - selectedInvoice.amountPaid;
                    setPayAmount(Math.min(val, outstanding));
                  }}
                  placeholder="Masukkan nominal bayar..."
                  className="w-full h-11 pl-9 pr-3 text-sm font-mono font-bold bg-muted/30 border border-border/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
                />
              </div>
              <div className="flex justify-end gap-1 px-1">
                <button
                  type="button"
                  onClick={() =>
                    setPayAmount(
                      selectedInvoice.totalAmount - selectedInvoice.amountPaid,
                    )
                  }
                  className="text-[10px] font-black text-primary hover:underline"
                >
                  Bayar Lunas Semua
                </button>
              </div>
            </div>

            {/* Payment Method chips */}
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">
                Metode Pembayaran
              </span>
              <div className="grid grid-cols-2 gap-3">
                {["CASH", "TRANSFER"].map((method) => {
                  const isSelected = payMethod === method;
                  return (
                    <Button
                      key={method}
                      variant={isSelected ? "default" : "outline"}
                      onClick={() => setPayMethod(method)}
                      className={`h-11 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                        isSelected
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "hover:bg-muted text-muted-foreground border-border/60"
                      }`}
                    >
                      {method === "CASH" ? (
                        <LuDollarSign size={13} />
                      ) : (
                        <LuCreditCard size={13} />
                      )}
                      {method}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Actions button */}
            <div className="flex justify-end gap-2.5 border-t border-border/20 pt-4">
              <Button
                variant="outline"
                className="rounded-xl text-xs font-bold px-4 border-border/50"
                onClick={() => setIsPayOpen(false)}
                disabled={processPaymentMutation.isPending}
              >
                Batal
              </Button>
              <Button
                className="rounded-xl text-xs font-black px-5 bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-md disabled:opacity-50"
                onClick={handleProcessPayment}
                disabled={processPaymentMutation.isPending || payAmount <= 0}
              >
                {processPaymentMutation.isPending ? (
                  <>
                    <div className="h-3 w-3 rounded-full border border-white border-t-transparent animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <LuCheck size={13} />
                    Simpan Pelunasan
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* DIALOG 3: Category-Grouped SPK (Surat Perintah Kerja) Release Dialog */}
      <Dialog
        isOpen={isSpkOpen}
        onClose={() => setIsSpkOpen(false)}
        size="lg"
        className="rounded-3xl p-6 bg-card border border-border/50 text-foreground overflow-hidden max-h-[90vh] flex flex-col"
        showCloseButton={true}
      >
        {selectedInvoice && (
          <div className="space-y-5 flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex flex-col gap-1 border-b border-border/30 pb-4 pr-10">
              <h2 className="text-xl font-black tracking-tight text-foreground flex items-center gap-2">
                <LuScissors className="text-primary animate-pulse" size={22} />
                Rilis Surat Perintah Kerja (SPK)
              </h2>
              <p className="text-xs text-muted-foreground font-semibold">
                Sistem mengelompokkan item cetakan secara otomatis berdasarkan
                divisi mesin untuk didistribusikan ke workshop.
              </p>
            </div>

            {/* Invoice Meta */}
            <div className="grid grid-cols-2 gap-4 bg-muted/20 p-3.5 rounded-2xl border border-border/20 text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider block">
                  No. Nota
                </span>
                <span className="font-mono font-black text-foreground">
                  {selectedInvoice.invoiceNo}
                </span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider block">
                  Pelanggan
                </span>
                <span className="font-black text-foreground">
                  {selectedInvoice.customerName}
                </span>
              </div>
            </div>

            {/* Category Groups Container */}
            <div className="overflow-y-auto space-y-3 pr-1.5 flex-1 max-h-[45vh] scrollbar-thin">
              {isLoadingSpk ? (
                <div className="py-12 text-center space-y-3">
                  <div className="relative w-8 h-8 mx-auto">
                    <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
                    <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  </div>
                  <span className="text-xs font-bold text-muted-foreground block">
                    Mengambil data divisi SPK...
                  </span>
                </div>
              ) : spkResponse && spkResponse.spk_by_category.length > 0 ? (
                spkResponse.spk_by_category.map((category) => (
                  <div
                    key={category.category_id}
                    className="flex items-center justify-between p-4 rounded-2xl border border-border/40 bg-card hover:bg-muted/30 transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <LuScissors size={18} />
                      </div>
                      <div>
                        <span className="font-bold text-sm text-foreground block">
                          {category.category_name}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-semibold block mt-0.5">
                          {category.items.length || 0} item cetakan terdeteksi
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handlePrintSpk(category.category_name)}
                      className="h-9 px-4 rounded-xl text-xs font-black bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border-0 active:scale-95 transition-all flex items-center gap-1.5"
                    >
                      <LuPrinter size={13} />
                      Cetak SPK
                    </Button>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center space-y-2">
                  <LuInfo size={28} className="text-muted-foreground/60" />
                  <span className="text-xs font-bold text-muted-foreground">
                    Tidak ada item cetakan terdeteksi.
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </Dialog>

      {/* DIALOG 4: SPK Print Preview Dialog */}
      <Dialog
        isOpen={isSpkPreviewOpen}
        onClose={() => setIsSpkPreviewOpen(false)}
        size="md"
        className="rounded-3xl p-6 bg-card border border-border/50 text-foreground overflow-hidden max-h-[90vh] flex flex-col"
        showCloseButton={true}
      >
        {selectedInvoice && selectedSpkCategory && (
          <div className="space-y-5 flex flex-col overflow-hidden">
            {/* Header info */}
            <div className="flex flex-col gap-1 border-b border-border/30 pb-4 pr-10">
              <h2 className="text-xl font-black tracking-tight text-foreground flex items-center gap-2">
                <LuPrinter size={20} className="text-primary animate-pulse" />
                Preview SPK Kerja ({selectedSpkCategory})
              </h2>
              <p className="text-xs text-muted-foreground font-semibold">
                Simulasi hasil cetakan Surat Perintah Kerja (SPK) divisi
                workshop produksi.
              </p>
            </div>

            {/* Simulated Printed Paper Container */}
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl font-mono text-[11px] leading-relaxed text-slate-800 dark:text-slate-200 overflow-y-auto max-h-[50vh] shadow-inner">
              <div className="text-center space-y-1 pb-4 border-b border-dashed border-slate-300 dark:border-slate-700">
                <span className="font-black text-sm block tracking-widest">
                  SURAT PERINTAH KERJA (SPK)
                </span>
                <span className="font-bold text-[10px] bg-primary/20 text-primary px-3 py-1 rounded-full inline-block mt-1">
                  DIVISI: {selectedSpkCategory.toUpperCase()}
                </span>
              </div>

              {/* Meta information */}
              <div className="py-3 space-y-1 border-b border-dashed border-slate-300 dark:border-slate-700">
                <div className="flex justify-between">
                  <span>No. Nota:</span>
                  <span className="font-bold">{selectedInvoice.invoiceNo}</span>
                </div>
                <div className="flex justify-between">
                  <span>No. Tiket / Job:</span>
                  <span>{selectedInvoice.jobNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pelanggan:</span>
                  <span className="font-bold uppercase">
                    {selectedInvoice.customerName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tanggal:</span>
                  <span>{selectedInvoice.createdAt}</span>
                </div>
              </div>

              {/* Items in this category */}
              <div className="py-3 border-b border-dashed border-slate-300 dark:border-slate-700 space-y-3">
                <span className="font-bold block text-[10px] text-muted-foreground uppercase tracking-wider">
                  Daftar Item Produksi:
                </span>
                {activeSpkCategoryItems.map((item, idx) => (
                  <div
                    key={item.id}
                    className="space-y-1 bg-white dark:bg-slate-950 p-2.5 rounded-lg border border-slate-100 dark:border-slate-900"
                  >
                    <div className="flex justify-between font-bold text-foreground">
                      <span>
                        {idx + 1}.{" "}
                        {item.variant_name
                          ? `${item.product_name} (${item.variant_name})`
                          : item.product_name}
                      </span>
                      <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px]">
                        {item.quantity} Qty
                      </span>
                    </div>
                    {(item.uom === "m2" || item.uom === "m_lari") &&
                      item.length_cm &&
                      item.width_cm && (
                        <div className="text-[10px] text-primary font-black mt-0.5">
                          Ukuran: {item.length_cm} x {item.width_cm} cm (
                          {item.uom})
                        </div>
                      )}
                    {item.production_notes &&
                      item.production_notes !== "-" &&
                      item.production_notes !== "" && (
                        <div className="text-[10px] text-rose-500 font-bold border-l-2 border-rose-500 pl-2 mt-1">
                          Catatan: {item.production_notes}
                        </div>
                      )}
                  </div>
                ))}
              </div>

              <div className="text-center pt-5 text-[10px] text-muted-foreground space-y-0.5 font-bold">
                <span className="block">
                  --- HARAP DIKERJAKAN SESUAI SPESIFIKASI ---
                </span>
                <span className="block text-[9px] font-medium">
                  Sistem ERP Digital Printing
                </span>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end gap-3 border-t border-border/30 pt-4 mt-2">
              <Button
                variant="outline"
                onClick={() => setIsSpkPreviewOpen(false)}
                className="h-10 px-5 rounded-xl font-bold border-border/60 hover:bg-muted/50"
              >
                Tutup
              </Button>
              <Button
                onClick={() => {
                  toast.success(
                    "Mencetak SPK...",
                    `SPK Divisi ${selectedSpkCategory} berhasil dikirim ke printer workshop produksi.`,
                  );
                  setIsSpkPreviewOpen(false);
                }}
                className="h-10 px-6 rounded-xl font-black bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 flex items-center gap-2 transition-all active:scale-95"
              >
                <LuPrinter size={16} />
                Cetak SPK
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};

export default InvoicePage;

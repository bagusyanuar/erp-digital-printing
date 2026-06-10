import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@erp-digital-printing/ui/Button";
import { TextField } from "@erp-digital-printing/ui/TextField";
import { Card, CardHeader, CardContent } from "@erp-digital-printing/ui/Card";
import {
  LuPlus,
  LuSearch,
  LuFileText,
  LuEllipsisVertical,
  LuPencil,
  LuTrash2,
  LuInfo,
  LuSend,
  LuFilter,
  LuCalendar,
  LuBox,
  LuUser,
  LuLoader,
} from "@erp-digital-printing/ui/icons";
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
} from "@erp-digital-printing/ui/Dropdown";
import { Dialog } from "@erp-digital-printing/ui/Dialog";
import { toast } from "@erp-digital-printing/ui/Toast";
import {
  flexRender,
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  createColumnHelper,
} from "@tanstack/react-table";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TablePagination,
} from "@erp-digital-printing/ui/Table";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useOrderDI } from "@presentation/order/hooks/useOrderDI";
import { orderKeys } from "@infrastructure/order/keys";
import type { AppError } from "@core/shared/errors/domain.error";
import type {
  OrderModel,
  OrderItemModel,
} from "@core/order/domains/models/order.model";
import type { PaginatedResponse } from "@core/shared/api/pagination";

interface JobItem {
  id: string;
  productName: string;
  dimension: string;
  qty: number;
  finishing: string;
}

interface JobTransaction {
  id: string;
  ticketNo: string;
  customerName: string;
  customerPhone: string;
  resellerId: string | null;
  customerLevel: string;
  status: "Pending" | "Dikirim ke Kasir";
  createdAt: string;
  items: JobItem[];
  notes?: string;
}

const columnHelper = createColumnHelper<JobTransaction>();

const JobEntryPage = () => {
  const navigate = useNavigate();
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "Semua" | "Pending" | "Dikirim ke Kasir"
  >("Pending");
  const [selectedTransaction, setSelectedTransaction] =
    useState<JobTransaction | null>(null);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const { getOrdersUseCase, submitOrderUseCase, updateOrderStatusUseCase } =
    useOrderDI();
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null);
  const [cancelTargetTicket, setCancelTargetTicket] = useState<string>("");

  // Map local status state filter to API query parameters
  const mappedStatus = useMemo(() => {
    if (statusFilter === "Pending") return "DRAFT";
    if (statusFilter === "Dikirim ke Kasir") {
      return "PENDING_PAYMENT,IN_PRODUCTION,READY_FOR_PICKUP,COMPLETED,CANCELLED";
    }
    return undefined;
  }, [statusFilter]);

  // Fetch real order data from backend API
  const {
    data: response,
    isLoading,
    isFetching,
    refetch,
  } = useQuery<PaginatedResponse<OrderModel>, AppError>({
    queryKey: orderKeys.list({
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      status: mappedStatus,
    }),
    queryFn: () =>
      getOrdersUseCase.execute({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        status: mappedStatus,
      }),
    staleTime: 10_000,
    gcTime: 30_000,
    refetchOnWindowFocus: false,
  });

  // Map API Order models to JobTransaction presentation interface
  const transactions = useMemo((): JobTransaction[] => {
    return (response?.data ?? []).map(
      (order: OrderModel): JobTransaction => ({
        id: order.id,
        ticketNo: order.job_number,
        customerName: order.customer_name || "Customer Walk In",
        customerPhone: order.customer_phone || "-",
        resellerId: order.reseller_id,
        customerLevel: "DITENTUKAN KASIR",
        status: order.status === "DRAFT" ? "Pending" : "Dikirim ke Kasir",
        createdAt: order.created_at,
        notes: order.notes,
        items: (order.order_items ?? []).map(
          (item: OrderItemModel): JobItem => {
            let dimensionText = "Pcs";
            if (item.uom === "m2" || item.uom === "m_lari") {
              dimensionText = `${item.length_cm || 0} x ${item.width_cm || 0} cm (${item.uom})`;
            } else if (item.uom === "box") {
              dimensionText = "Box";
            } else if (item.uom === "lembar") {
              dimensionText = "Lembar A3+";
            }
            return {
              id: item.id,
              productName: item.variant_name
                ? `${item.product_name} (${item.variant_name})`
                : item.product_name,
              dimension: dimensionText,
              qty: item.quantity,
              finishing: "-",
            };
          },
        ),
      }),
    );
  }, [response]);

  // Mutation to submit draft order to cashier
  const submitOrderMutation = useMutation<void, AppError, string>({
    mutationFn: (id: string) => submitOrderUseCase.execute(id),
    onSuccess: () => {
      toast.success(
        "Terkirim ke Kasir",
        "Tiket pesanan berhasil dikirim ke Kasir.",
      );
      refetch();
      setSelectedTransaction(null);
    },
    onError: (error: AppError) => {
      toast.error(
        "Gagal Mengirim ke Kasir",
        error.message || "Terjadi kesalahan saat mengirim ke Kasir.",
      );
    },
  });

  // Mutation to cancel order
  const cancelOrderMutation = useMutation<void, AppError, string>({
    mutationFn: (id: string) =>
      updateOrderStatusUseCase.execute(id, "CANCELLED"),
    onSuccess: () => {
      toast.success(
        "Transaksi Dibatalkan",
        "Tiket pesanan berhasil dibatalkan.",
      );
      refetch();
      setSelectedTransaction(null);
    },
    onError: (error: AppError) => {
      toast.error(
        "Gagal Membatalkan Transaksi",
        error.message || "Terjadi kesalahan saat membatalkan transaksi.",
      );
    },
  });

  // Action Helpers
  const handleSendToKasir = (id: string) => {
    submitOrderMutation.mutate(id);
  };

  const handleCancelOrder = () => {
    if (!cancelTargetId) return;
    cancelOrderMutation.mutate(cancelTargetId);
    setIsCancelConfirmOpen(false);
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor("ticketNo", {
        header: "No. Tiket / Transaksi",
        cell: (info) => (
          <span className="font-mono font-bold text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg border border-slate-200/50">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("createdAt", {
        header: "Tanggal Buat",
        cell: (info) => (
          <div className="flex items-center gap-2 text-muted-foreground text-sm font-semibold">
            <LuCalendar size={14} className="text-primary/70" />
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor("customerName", {
        header: "Pelanggan",
        cell: (info) => {
          const isReseller = !!info.row.original.resellerId;
          return (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-foreground text-sm flex items-center gap-1 shrink-0">
                  <LuUser size={13} className="text-primary/70" />
                  {info.getValue()}
                </span>
                <span
                  className={`inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border leading-none shrink-0 ${
                    isReseller
                      ? "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-900/50"
                      : "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/30 dark:text-slate-400 dark:border-slate-800/50"
                  }`}
                >
                  {isReseller ? "Biro" : "Retail"}
                </span>
              </div>
              <span className="text-[11px] text-muted-foreground font-semibold">
                {info.row.original.customerPhone}
              </span>
            </div>
          );
        },
      }),
      columnHelper.accessor("items", {
        header: "Daftar Cetakan (Multi-Product)",
        cell: (info) => {
          const items = info.getValue();
          return (
            <div className="flex flex-col gap-1 max-w-xs">
              <span className="text-xs font-bold text-primary">
                {items.length} Item Cetakan:
              </span>
              <div className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {items.map((it) => `${it.productName} (${it.qty}x)`).join(", ")}
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => {
          const val = info.getValue();
          const isPending = val === "Pending";
          return (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                isPending
                  ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50"
                  : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50"
              }`}
            >
              {val}
            </span>
          );
        },
      }),
      columnHelper.display({
        id: "actions",
        header: "Aksi",
        cell: (info) => {
          const isPending = info.row.original.status === "Pending";
          return (
            <div className="text-right">
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
                    onClick={() => setSelectedTransaction(info.row.original)}
                  >
                    <LuInfo className="h-3.5 w-3.5 text-primary" />
                    <span>Detail Pesanan</span>
                  </DropdownItem>
                  {isPending && (
                    <>
                      <DropdownItem
                        onClick={() => handleSendToKasir(info.row.original.id)}
                      >
                        <LuSend className="h-3.5 w-3.5 text-emerald-600" />
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                          Kirim ke Kasir
                        </span>
                      </DropdownItem>
                      <DropdownItem
                        onClick={() =>
                          navigate(
                            `/job-entry/create?edit=${info.row.original.id}`,
                          )
                        }
                      >
                        <LuPencil className="h-3.5 w-3.5 text-blue-600" />
                        <span>Edit Tiket</span>
                      </DropdownItem>
                      <DropdownItem
                        variant="danger"
                        onClick={() => {
                          setCancelTargetId(info.row.original.id);
                          setCancelTargetTicket(info.row.original.ticketNo);
                          setIsCancelConfirmOpen(true);
                        }}
                      >
                        <LuTrash2 className="h-3.5 w-3.5 text-rose-600" />
                        <span>Batalkan Tiket</span>
                      </DropdownItem>
                    </>
                  )}
                </DropdownContent>
              </Dropdown>
            </div>
          );
        },
      }),
    ],
    [transactions],
  );

  const table = useReactTable({
    data: transactions,
    columns,
    state: {
      globalFilter,
      pagination,
    },
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true,
    pageCount: Math.ceil((response?.total ?? 0) / pagination.pageSize),
  });

  return (
    <div className="p-6 space-y-8 font-sans bg-background min-h-screen animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
            <LuFileText className="text-primary" size={32} />
            Job Entry (Desainer)
          </h1>
          <p className="text-muted-foreground font-medium">
            Kelola draf keranjang belanja aktif dan input spesifikasi teknis
            cetakan sebelum dikirim ke Kasir.
          </p>
        </div>
      </div>

      {/* Main Table Card */}
      <Card className="rounded-3xl overflow-hidden shadow-sm border-border/50">
        <CardHeader className="flex flex-col gap-4 border-b border-border/30 p-6 bg-card">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="flex-1 w-full md:max-w-md">
              <TextField
                placeholder="Cari nomor tiket, customer, atau produk..."
                prefixIcon={LuSearch}
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Right Actions (Button Tambah Job Entry) */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <Button
                className="h-10 px-4 rounded-xl font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                onClick={() => navigate("/job-entry/create")}
              >
                <LuPlus size={18} />
                Tambah Job Entry
              </Button>
            </div>
          </div>

          {/* Quick Filter Tabs (Pending vs Sent) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {(["Semua", "Pending", "Dikirim ke Kasir"] as const).map(
              (status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setStatusFilter(status);
                    table.setPageIndex(0);
                  }}
                  className={`h-8 rounded-lg text-xs font-bold transition-all shrink-0 ${
                    statusFilter === status
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted text-muted-foreground"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <LuFilter size={12} />
                    {status}
                  </span>
                </Button>
              ),
            )}
          </div>
        </CardHeader>

        {/* Table Body */}
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={
                        header.column.id === "actions" ? "text-right" : ""
                      }
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-32 text-center text-muted-foreground font-semibold"
                  >
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="relative w-8 h-8">
                        <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
                        <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                      </div>
                      <span>Memuat Daftar Tiket Kerja...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-muted-foreground font-semibold"
                  >
                    Tidak ada tiket kerja ditemukan.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>

        {/* Table Pagination */}
        <TablePagination
          currentPage={table.getState().pagination.pageIndex + 1}
          totalPages={table.getPageCount()}
          pageSize={table.getState().pagination.pageSize}
          totalEntries={response?.total ?? 0}
          onPageChange={(page) => table.setPageIndex(page - 1)}
          onPageSizeChange={(size) => table.setPageSize(size)}
        />
      </Card>

      {/* Dialog Detail Pesanan Multi-Product (Tanpa Info Harga) */}
      <Dialog
        isOpen={!!selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
        size="lg"
        className="rounded-3xl p-6 bg-card border border-border/50 text-foreground overflow-hidden max-h-[90vh] flex flex-col"
        showCloseButton={true}
      >
        {selectedTransaction && (
          <div className="space-y-5 flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex flex-col gap-1.5 border-b border-border/30 pb-4 pr-10">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-xs bg-muted px-2.5 py-1 rounded-lg border border-border/50 text-foreground/80">
                  {selectedTransaction.ticketNo}
                </span>
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wide ${
                    selectedTransaction.status === "Pending"
                      ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50"
                      : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50"
                  }`}
                >
                  {selectedTransaction.status}
                </span>
              </div>
              <h2 className="text-xl font-black tracking-tight text-foreground flex items-center gap-2 mt-1">
                <LuFileText className="text-primary" size={22} />
                Detail Keranjang Cetak
              </h2>
            </div>

            {/* Customer Details info block */}
            <div className="grid grid-cols-2 gap-4 bg-primary/5 p-4 rounded-2xl border border-primary/10 text-xs">
              <div className="space-y-1.5">
                <span className="text-primary/70 font-bold block uppercase tracking-wider text-[10px]">
                  Pelanggan
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-foreground text-sm flex items-center gap-1 leading-none shrink-0">
                    <LuUser size={15} className="text-primary" />
                    {selectedTransaction.customerName}
                  </span>
                  <span
                    className={`inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border leading-none shrink-0 ${
                      selectedTransaction.resellerId
                        ? "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-900/50"
                        : "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/30 dark:text-slate-400 dark:border-slate-800/50"
                    }`}
                  >
                    {selectedTransaction.resellerId ? "Biro" : "Retail"}
                  </span>
                </div>
                <span className="text-[11px] text-muted-foreground font-semibold block pl-5 leading-none">
                  {selectedTransaction.customerPhone}
                </span>
              </div>
              <div className="space-y-1.5">
                <span className="text-primary/70 font-bold block uppercase tracking-wider text-[10px]">
                  Waktu Input
                </span>
                <span className="font-bold text-foreground text-sm flex items-center gap-1.5">
                  <LuCalendar size={15} className="text-primary" />
                  {selectedTransaction.createdAt}
                </span>
              </div>
            </div>

            {/* Order Items List (Scrollable) */}
            <div className="overflow-y-auto space-y-3 pr-2 max-h-[40vh] scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
              <span className="text-xs font-black uppercase tracking-widest text-muted-foreground block mb-1">
                Daftar Item Cetakan ({selectedTransaction.items.length})
              </span>

              {selectedTransaction.items.map((item, idx) => (
                <div
                  key={item.id}
                  className="py-4 border-b border-border/20 last:border-0"
                >
                  {/* Item title with sequential index */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex gap-3 items-center">
                      <span className="h-6 w-6 rounded-full bg-muted text-muted-foreground text-[11px] font-black flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-sm font-bold text-foreground leading-snug">
                        {item.productName}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-foreground/70 bg-muted/50 px-2.5 py-1 rounded-md">
                      Qty: {item.qty}
                    </span>
                  </div>

                  {/* Technical Specs */}
                  <div className="text-xs pl-9">
                    <div className="space-y-1">
                      <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                        <LuBox size={13} />
                        Ukuran / Satuan
                      </span>
                      <span className="font-bold text-foreground block">
                        {item.dimension}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Dialog Footer Actions */}
            <div className="flex items-center justify-end gap-3 border-t border-border/30 pt-4 mt-2">
              <Button
                variant="outline"
                onClick={() => setSelectedTransaction(null)}
                className="h-10 px-5 rounded-xl font-bold border-border/60 hover:bg-muted/50"
              >
                Tutup
              </Button>
              {selectedTransaction.status === "Pending" && (
                <Button
                  onClick={() => handleSendToKasir(selectedTransaction.id)}
                  disabled={submitOrderMutation.isPending}
                  className="h-10 px-6 rounded-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 flex items-center gap-2 transition-all active:scale-95"
                >
                  <LuSend size={16} />
                  {submitOrderMutation.isPending
                    ? "Mengirim..."
                    : "Kirim ke Kasir"}
                </Button>
              )}
            </div>
          </div>
        )}
      </Dialog>

      {/* Confirmation Dialog: Cancel Order */}
      <Dialog
        isOpen={isCancelConfirmOpen}
        onClose={() => setIsCancelConfirmOpen(false)}
        size="sm"
        className="rounded-3xl p-6 bg-card border border-border/50 text-foreground"
        showCloseButton={true}
      >
        <div className="space-y-5 flex flex-col">
          <div className="flex flex-col gap-1 border-b border-border/30 pb-4 pr-10">
            <h2 className="text-lg font-black tracking-tight text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <LuTrash2 size={18} />
              Batalkan Transaksi?
            </h2>
            <p className="text-xs text-muted-foreground font-semibold">
              Konfirmasi pembatalan tiket pesanan.
            </p>
          </div>

          <p className="text-xs text-foreground/80 leading-relaxed font-semibold">
            Apakah Anda yakin ingin membatalkan transaksi tiket{" "}
            <span className="font-mono font-bold text-foreground bg-muted px-1.5 py-0.5 rounded border border-border/50">
              {cancelTargetTicket}
            </span>{" "}
            secara permanen?
          </p>

          <div className="flex items-center justify-end gap-3 border-t border-border/30 pt-4 mt-2">
            <Button
              variant="outline"
              onClick={() => setIsCancelConfirmOpen(false)}
              className="h-9 px-4 rounded-xl font-bold border-border/60 hover:bg-muted/50 text-xs"
            >
              Batal
            </Button>
            <Button
              onClick={handleCancelOrder}
              className="h-9 px-5 rounded-xl font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/25 flex items-center gap-1.5 text-xs transition-all active:scale-95"
            >
              <LuTrash2 size={14} />
              Ya, Batalkan
            </Button>
          </div>
        </div>
      </Dialog>

      <AnimatePresence>
        {(submitOrderMutation.isPending || cancelOrderMutation.isPending) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-background/80 backdrop-blur-md flex flex-col items-center justify-center gap-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="p-8 rounded-3xl bg-card border border-border/50 shadow-2xl flex flex-col items-center justify-center text-center max-w-sm mx-4"
            >
              <div className="relative w-16 h-16 flex items-center justify-center bg-primary/10 rounded-2xl mb-4">
                <LuLoader className="animate-spin text-primary" size={32} />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-1">
                {submitOrderMutation.isPending
                  ? "Mengirim ke Kasir"
                  : "Membatalkan Transaksi"}
              </h3>
              <p className="text-xs text-muted-foreground font-semibold">
                {submitOrderMutation.isPending
                  ? "Sedang memproses tiket pesanan Anda. Mohon tidak menutup halaman ini."
                  : "Sedang membatalkan transaksi di server. Mohon tunggu."}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default JobEntryPage;

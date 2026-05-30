import React, { useState, useMemo } from "react";
import { Button } from "@erp-digital-printing/ui/Button";
import { TextField } from "@erp-digital-printing/ui/TextField";
import {
  Card,
  CardHeader,
  CardContent,
} from "@erp-digital-printing/ui/Card";
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
  LuScissors,
  LuUser,
} from "@erp-digital-printing/ui/icons";
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
} from "@erp-digital-printing/ui/Dropdown";
import { Dialog } from "@erp-digital-printing/ui/Dialog";
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
  customerLevel: string;
  status: "Pending" | "Dikirim ke Kasir"; // Mengganti Draft dengan Pending sesuai arahan user
  createdAt: string;
  items: JobItem[];
}

const columnHelper = createColumnHelper<JobTransaction>();

const JobEntryPage = () => {
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"Semua" | "Pending" | "Dikirim ke Kasir">("Semua");
  const [selectedTransaction, setSelectedTransaction] = useState<JobTransaction | null>(null);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Mock data dengan status 'Pending' hasil penyesuaian alur
  const mockTransactions = useMemo((): JobTransaction[] => [
    {
      id: "1",
      ticketNo: "JOB-20260530-001",
      customerName: "Budi Raharjo",
      customerLevel: "Regular",
      status: "Pending", // Sesi keranjang yang belum selesai / menunggu file fix
      createdAt: "30 Mei 2026, 21:10",
      items: [
        {
          id: "1-1",
          productName: "Spanduk MMT 280g (Banner)",
          dimension: "300 x 100 cm (m²)",
          qty: 2,
          finishing: "Mata Ayam (4 pojok)",
        },
        {
          id: "1-2",
          productName: "Kartu Nama AP260 (A3+)",
          dimension: "Box",
          qty: 2,
          finishing: "Laminasi Doff, Potong Kotak",
        }
      ]
    },
    {
      id: "2",
      ticketNo: "JOB-20260530-002",
      customerName: "CV Maju Jaya",
      customerLevel: "Reseller",
      status: "Pending",
      createdAt: "30 Mei 2026, 21:15",
      items: [
        {
          id: "2-1",
          productName: "Stiker Vinyl Glossy (Indoor)",
          dimension: "150 x 150 cm (m²)",
          qty: 1,
          finishing: "Laminasi Doff, Potong Pas",
        }
      ]
    },
    {
      id: "3",
      ticketNo: "JOB-20260530-003",
      customerName: "Toko Sumber Rejeki",
      customerLevel: "Reseller",
      status: "Dikirim ke Kasir",
      createdAt: "30 Mei 2026, 20:45",
      items: [
        {
          id: "3-1",
          productName: "Kartu Nama AP260 (A3+)",
          dimension: "Box",
          qty: 10,
          finishing: "Tanpa Laminasi, Potong Kotak",
        },
        {
          id: "3-2",
          productName: "X-Banner Albatros (Indoor)",
          dimension: "60 x 160 cm (pcs)",
          qty: 3,
          finishing: "Laminasi Glossy + Stand Banner",
        },
        {
          id: "3-3",
          productName: "Brosur AP120 (A3+)",
          dimension: "Lembar A3+",
          qty: 50,
          finishing: "Lipat 3",
        }
      ]
    },
    {
      id: "4",
      ticketNo: "JOB-20260530-004",
      customerName: "Rudi Hermawan",
      customerLevel: "Regular",
      status: "Pending",
      createdAt: "30 Mei 2026, 19:30",
      items: [
        {
          id: "4-1",
          productName: "X-Banner Albatros (Indoor)",
          dimension: "60 x 160 cm (pcs)",
          qty: 3,
          finishing: "Laminasi Glossy + Stand Banner",
        }
      ]
    },
  ], []);

  // Filter data berdasarkan search dan filter tab status
  const filteredTransactions = useMemo(() => {
    return mockTransactions.filter((tr) => {
      const matchesSearch =
        tr.customerName.toLowerCase().includes(globalFilter.toLowerCase()) ||
        tr.ticketNo.toLowerCase().includes(globalFilter.toLowerCase()) ||
        tr.items.some(item => item.productName.toLowerCase().includes(globalFilter.toLowerCase()));

      const matchesStatus =
        statusFilter === "Semua" ? true : tr.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [mockTransactions, globalFilter, statusFilter]);

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
        cell: (info) => (
          <div className="flex flex-col gap-0.5">
            <span className="font-bold text-foreground text-sm">
              {info.getValue()}
            </span>
            <span className="inline-self-start text-[10px] font-bold px-1.5 py-0.2 bg-muted text-muted-foreground rounded uppercase tracking-wider w-max border border-border/50">
              {info.row.original.customerLevel}
            </span>
          </div>
        ),
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
                  <DropdownItem onClick={() => setSelectedTransaction(info.row.original)}>
                    <LuInfo className="h-3.5 w-3.5 text-primary" />
                    <span>Detail Pesanan</span>
                  </DropdownItem>
                  {isPending && (
                    <>
                      <DropdownItem onClick={() => alert(`Mengirim ${info.row.original.ticketNo} ke Kasir`)}>
                        <LuSend className="h-3.5 w-3.5 text-emerald-600" />
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Kirim ke Kasir</span>
                      </DropdownItem>
                      <DropdownItem onClick={() => alert(`Ubah transaksi: ${info.row.original.ticketNo}`)}>
                        <LuPencil className="h-3.5 w-3.5 text-blue-600" />
                        <span>Edit Tiket</span>
                      </DropdownItem>
                      <DropdownItem variant="danger" onClick={() => alert(`Hapus transaksi: ${info.row.original.ticketNo}`)}>
                        <LuTrash2 className="h-3.5 w-3.5 text-rose-600" />
                        <span>Hapus</span>
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
    []
  );

  const table = useReactTable({
    data: filteredTransactions,
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
            Kelola draf keranjang belanja aktif dan input spesifikasi teknis cetakan sebelum dikirim ke Kasir.
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
                onClick={() => alert("Tombol Tambah Job Entry diklik! (Sesuai request, form belum dibuat)")}
              >
                <LuPlus size={18} />
                Tambah Job Entry
              </Button>
            </div>
          </div>

          {/* Quick Filter Tabs (Pending vs Sent) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {(["Semua", "Pending", "Dikirim ke Kasir"] as const).map((status) => (
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
            ))}
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
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
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
          totalEntries={filteredTransactions.length}
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
          <div className="space-y-6 flex-1 flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex flex-col gap-1 border-b border-border/30 pb-4">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-1 rounded">
                  {selectedTransaction.ticketNo}
                </span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    selectedTransaction.status === "Pending"
                      ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50"
                      : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50"
                  }`}
                >
                  {selectedTransaction.status}
                </span>
              </div>
              <h2 className="text-xl font-black tracking-tight text-foreground flex items-center gap-2 mt-2">
                <LuFileText className="text-primary" size={20} />
                Detail Keranjang Cetak
              </h2>
            </div>

            {/* Customer Details info block */}
            <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-2xl border border-border/30 text-xs">
              <div className="space-y-1">
                <span className="text-muted-foreground font-semibold block uppercase tracking-wider text-[10px]">Pelanggan</span>
                <span className="font-bold text-foreground text-sm flex items-center gap-1.5">
                  <LuUser size={14} className="text-primary/70" />
                  {selectedTransaction.customerName}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground font-semibold block uppercase tracking-wider text-[10px]">Waktu Input</span>
                <span className="font-bold text-foreground text-sm flex items-center gap-1.5">
                  <LuCalendar size={14} className="text-primary/70" />
                  {selectedTransaction.createdAt}
                </span>
              </div>
            </div>

            {/* Order Items List (Scrollable) */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 min-h-[200px]">
              <span className="text-xs font-black uppercase tracking-wider text-muted-foreground block">
                Daftar Item Cetakan ({selectedTransaction.items.length})
              </span>
              
              {selectedTransaction.items.map((item, idx) => (
                <div 
                  key={item.id}
                  className="p-4 rounded-2xl border border-border/50 bg-card hover:bg-muted/10 transition-all flex flex-col gap-3"
                >
                  {/* Item title with sequential index */}
                  <div className="flex items-center justify-between border-b border-border/20 pb-2">
                    <span className="text-sm font-bold text-foreground flex items-center gap-2">
                      <span className="h-5 w-5 rounded bg-primary/10 text-primary text-[10px] font-black flex items-center justify-center">
                        {idx + 1}
                      </span>
                      {item.productName}
                    </span>
                    <span className="text-xs font-black bg-primary/10 text-primary px-2 py-0.5 rounded">
                      Qty: {item.qty}
                    </span>
                  </div>

                  {/* Technical Specs grid (NO PRICES) */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <span className="text-muted-foreground font-medium flex items-center gap-1">
                        <LuBox size={12} />
                        Ukuran / Satuan
                      </span>
                      <span className="font-bold text-foreground block pl-4">
                        {item.dimension}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-muted-foreground font-medium flex items-center gap-1">
                        <LuScissors size={12} />
                        Finishing Add-ons
                      </span>
                      <span className="font-bold text-blue-600 dark:text-blue-400 block pl-4">
                        {item.finishing || "-"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Dialog Footer Actions */}
            <div className="flex items-center justify-end gap-3 border-t border-border/30 pt-4 mt-auto">
              <Button 
                variant="outline" 
                onClick={() => setSelectedTransaction(null)}
                className="h-10 px-5 rounded-xl font-bold"
              >
                Tutup
              </Button>
              {selectedTransaction.status === "Pending" && (
                <Button 
                  onClick={() => {
                    alert(`Mengirim ${selectedTransaction.ticketNo} ke Kasir`);
                    setSelectedTransaction(null);
                  }}
                  className="h-10 px-5 rounded-xl font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/20 flex items-center gap-2"
                >
                  <LuSend size={16} />
                  Kirim ke Kasir
                </Button>
              )}
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};

export default JobEntryPage;

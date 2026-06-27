import React, { useState, useMemo } from "react";
import { Button } from "@erp-digital-printing/ui/Button";
import { TextField } from "@erp-digital-printing/ui/TextField";
import { Card, CardContent } from "@erp-digital-printing/ui/Card";
import {
  DateRangePicker,
} from "@erp-digital-printing/ui/DateRangePicker";
import { toast } from "@erp-digital-printing/ui/Toast";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TablePagination,
} from "@erp-digital-printing/ui/Table";
import {
  LuPlus,
  LuSearch,
  LuWallet,
  LuArrowRightLeft,
  LuBuilding,
} from "@erp-digital-printing/ui/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FundTransferFormDialog } from "../components/FundTransferFormDialog";
import { useFundTransferTable } from "../hooks/useFundTransferTable";
import { useFundTransferDI } from "../hooks/useFundTransferDI";
import { fundTransferKeys } from "@infrastructure/fund-transfer/keys/fund-transfer.key";

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function FundTransferPage() {
  const {
    transfers,
    totalEntries,
    totalPages,
    page,
    setPage,
    pageSize,
    setPageSize,
    searchQuery,
    setSearchQuery,
    dateRange,
    setDateRange,
    isLoading,
  } = useFundTransferTable();

  const [isFormOpen, setIsFormOpen] = useState(false);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val);
  };

  const queryClient = useQueryClient();
  const { createFundTransferUseCase, getFundTransferWidgetsUseCase } = useFundTransferDI();

  const startDateStr = dateRange?.from ? formatDate(dateRange.from) : undefined;
  const endDateStr = dateRange?.to ? formatDate(dateRange.to) : undefined;

  const { data: widgetsData } = useQuery({
    queryKey: fundTransferKeys.widgets({
      startDate: startDateStr,
      endDate: endDateStr,
    }),
    queryFn: () =>
      getFundTransferWidgetsUseCase.execute({
        startDate: startDateStr,
        endDate: endDateStr,
      }),
  });

  const createMutation = useMutation({
    mutationFn: (input: {
      sourceAccount: string;
      destinationAccount: string;
      amount: number;
      description: string;
    }) =>
      createFundTransferUseCase.execute({
        fromAccount: input.sourceAccount,
        toAccount: input.destinationAccount,
        amount: input.amount,
        notes: input.description,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fundTransferKeys.all });
      toast.success("Sukses", "Pemindahan dana berhasil ditambahkan.");
      setIsFormOpen(false);
    },
    onError: (err: Error) => {
      toast.error("Gagal", err.message || "Gagal melakukan pemindahan dana.");
    },
  });

  const handleCreate = (newData: {
    date: string;
    sourceAccount: string;
    destinationAccount: string;
    amount: number;
    description: string;
  }) => {
    createMutation.mutate(newData);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Pemindahan Dana
          </h1>
          <p className="text-sm text-muted-foreground">
            Kelola dan catat transaksi mutasi dana antar rekening kas atau bank
            internal.
          </p>
        </div>
        <Button
          onClick={() => {
            setIsFormOpen(true);
          }}
          className="h-10 px-5 rounded-xl font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shrink-0 self-end md:self-auto"
        >
          <LuPlus size={18} />
          Tambah Pemindahan
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="rounded-3xl border-border/50 overflow-hidden relative shadow-sm hover:shadow-md transition-all duration-300 bg-gradient-to-br from-card via-card to-primary/5">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Total Pemindahan Dana
              </span>
              <h3 className="text-2xl font-black text-foreground tracking-tight">
                {formatCurrency(widgetsData?.totalAmount ?? 0)}
              </h3>
              <p className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium">
                Akumulasi pemindahan dana periode ini
              </p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm">
              <LuArrowRightLeft size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-border/50 overflow-hidden relative shadow-sm hover:shadow-md transition-all duration-300 bg-gradient-to-br from-card via-card to-emerald-500/5">
          <CardContent className="p-6">
            <div className="space-y-4 w-full">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest block">
                Metode Pemindahan
              </span>
              <div className="flex flex-wrap gap-4 items-center">
                {(!widgetsData?.breakdown || widgetsData.breakdown.length === 0) ? (
                  <span className="text-xs text-muted-foreground">Tidak ada data breakdown</span>
                ) : (
                  widgetsData.breakdown
                    .filter((item) => !item.accountName.toLowerCase().includes("qris"))
                    .map((item, idx) => {
                      const isCash = item.accountName.toLowerCase().includes("cash") || item.accountName.toLowerCase().includes("kas");
                      const colorClass = isCash ? "text-amber-600 bg-amber-500/10 border-amber-500/20" : "text-blue-600 bg-blue-500/10 border-blue-500/20";
                      const Icon = isCash ? LuWallet : LuBuilding;

                      return (
                        <div key={item.accountName} className={`flex items-center gap-3 ${idx > 0 ? "pl-4 border-l border-border/50" : ""}`}>
                          <div className={`h-10 w-10 rounded-xl flex items-center justify-center border shrink-0 ${colorClass}`}>
                            <Icon size={20} />
                          </div>
                          <div className="space-y-0.5 min-w-0">
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block uppercase ${colorClass}`}>
                              {item.accountName}
                            </span>
                            <h4 className="text-base font-black text-foreground tracking-tight truncate">
                              {formatCurrency(item.amount)}
                            </h4>
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Table */}
      <Card className="border-border/50 shadow-sm">
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-sm">
              <LuSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <TextField
                placeholder="Cari kas asal, tujuan, atau keterangan..."
                className="pl-10 h-10 border-border/50 bg-muted/20 focus:bg-background transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filter Date Range & Refresh */}
            <div className="flex flex-wrap items-center gap-3">
              <DateRangePicker
                value={dateRange}
                onChange={setDateRange}
                isClearable
                className="w-full sm:w-[260px] h-10 rounded-xl"
              />
            </div>
          </div>

          {/* Table */}
          <div className="border border-border/50 rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="w-[180px] text-center font-semibold text-xs uppercase tracking-wider">
                    Tanggal
                  </TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider">
                    Sumber Kas
                  </TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider">
                    Kas Tujuan
                  </TableHead>
                  <TableHead className="text-right font-semibold text-xs uppercase tracking-wider">
                    Nominal
                  </TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider">
                    Keterangan
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-32 text-center text-muted-foreground text-xs"
                    >
                      Sedang memuat data...
                    </TableCell>
                  </TableRow>
                ) : transfers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-32 text-center text-muted-foreground text-xs"
                    >
                      Tidak ada data pemindahan dana ditemukan.
                    </TableCell>
                  </TableRow>
                ) : (
                  transfers.map((item) => (
                    <TableRow
                      key={item.id}
                      className="hover:bg-muted/10 transition-colors"
                    >
                      <TableCell className="text-center text-xs text-muted-foreground">
                        {item.transferDate}
                      </TableCell>
                      <TableCell className="font-semibold text-xs text-rose-600">
                        {item.fromAccount}
                      </TableCell>
                      <TableCell className="font-semibold text-xs text-emerald-600">
                        {item.toAccount}
                      </TableCell>
                      <TableCell className="text-right font-bold text-xs text-foreground">
                        {formatCurrency(item.amount)}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                        {item.notes || "-"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <TablePagination
            currentPage={page}
            pageSize={pageSize}
            totalEntries={totalEntries}
            totalPages={totalPages}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <FundTransferFormDialog
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleCreate}
        loading={createMutation.isPending}
      />
    </div>
  );
}

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@erp-digital-printing/ui/Button";
import { TextField } from "@erp-digital-printing/ui/TextField";
import { Card, CardHeader, CardContent } from "@erp-digital-printing/ui/Card";
import {
  DateRangePicker,
  type DateRange,
} from "@erp-digital-printing/ui/DateRangePicker";
import { toast } from "@erp-digital-printing/ui/Toast";
import { useCapitalDI } from "../hooks/useCapitalDI";
import { capitalKeys } from "@infrastructure/capital/keys/capital.key";
import { useDebounce } from "../../shared/hooks/useDebounce";
import type { AppError } from "@core/shared/errors/domain.error";
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
  LuBanknote,
  LuWallet,
  LuBuilding,
} from "@erp-digital-printing/ui/icons";
import { CapitalInjectionFormDialog } from "../components/CapitalInjectionFormDialog";

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function CapitalInjectionPage() {
  const queryClient = useQueryClient();
  const {
    getCapitalTransactionsUseCase,
    createCapitalTransactionUseCase,
  } = useCapitalDI();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);

  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const today = new Date();
    return {
      from: today,
      to: today,
    };
  });
  const [isFormOpen, setIsFormOpen] = useState(false);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val);
  };

  const startDateStr = dateRange?.from ? formatDate(dateRange.from) : undefined;
  const endDateStr = dateRange?.to ? formatDate(dateRange.to) : undefined;

  // Fetch transactions using useQuery
  const { data: responseData, isLoading } = useQuery({
    queryKey: capitalKeys.list({
      page,
      limit: pageSize,
      type: "INJECTION",
      search: debouncedSearch,
      startDate: startDateStr,
      endDate: endDateStr,
    }),
    queryFn: () =>
      getCapitalTransactionsUseCase.execute({
        page,
        limit: pageSize,
        type: "INJECTION",
        search: debouncedSearch,
        startDate: startDateStr,
        endDate: endDateStr,
      }),
  });

  const transactionList = useMemo(
    () => responseData?.data ?? [],
    [responseData?.data],
  );
  const totalEntries = responseData?.total ?? 0;
  const totalPages = responseData?.limit
    ? Math.ceil(totalEntries / responseData.limit)
    : 1;

  // Calculate sum of visible transactions
  const totalAmount = useMemo(() => {
    return transactionList.reduce((acc, curr) => acc + curr.amount, 0);
  }, [transactionList]);

  // Calculate totals by payment method
  const totalCash = useMemo(() => {
    return transactionList.reduce(
      (acc, curr) => (curr.paymentMethod === "cash" ? acc + curr.amount : acc),
      0,
    );
  }, [transactionList]);

  const totalTransfer = useMemo(() => {
    return transactionList.reduce(
      (acc, curr) =>
        curr.paymentMethod === "transfer" ? acc + curr.amount : acc,
      0,
    );
  }, [transactionList]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: (input: {
      amount: number;
      paymentMethod: string;
      description: string;
    }) =>
      createCapitalTransactionUseCase.execute({
        type: "INJECTION",
        amount: input.amount,
        paymentMethod: input.paymentMethod,
        description: input.description,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: capitalKeys.all });
      toast.success("Sukses", "Setoran modal berhasil ditambahkan.");
      setIsFormOpen(false);
    },
    onError: (err: AppError) => {
      toast.error("Gagal", err.message || "Gagal menambahkan setoran modal.");
    },
  });

  const handleCreate = (newData: {
    date: string;
    amount: number;
    paymentMethod: string;
    description: string;
  }) => {
    createMutation.mutate({
      amount: newData.amount,
      paymentMethod: newData.paymentMethod,
      description: newData.description,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Setoran Modal
          </h1>
          <p className="text-sm text-muted-foreground">
            Kelola dan catat transaksi penyetoran modal dari investor atau
            owner.
          </p>
        </div>
        <Button
          onClick={() => {
            setIsFormOpen(true);
          }}
          className="h-10 px-5 rounded-xl font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shrink-0 self-end md:self-auto"
        >
          <LuPlus size={18} />
          Tambah Setoran Modal
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="rounded-3xl border-border/50 overflow-hidden relative shadow-sm hover:shadow-md transition-all duration-300 bg-gradient-to-br from-card via-card to-primary/5">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Total Setoran Modal
              </span>
              <h3 className="text-2xl font-black text-foreground tracking-tight">
                {formatCurrency(totalAmount)}
              </h3>
              <p className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium">
                Akumulasi modal terdaftar periode ini
              </p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm">
              <LuBanknote size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-border/50 overflow-hidden relative shadow-sm hover:shadow-md transition-all duration-300 bg-gradient-to-br from-card via-card to-emerald-500/5">
          <CardContent className="p-6">
            <div className="space-y-4 w-full">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest block">
                Metode Setoran
              </span>
              <div className="grid grid-cols-2 gap-4 divide-x divide-border/50">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 shrink-0">
                    <LuWallet size={20} />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-[10px] font-semibold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full inline-block">
                      Kas Kecil
                    </span>
                    <h4 className="text-base font-black text-foreground tracking-tight truncate">
                      {formatCurrency(totalCash)}
                    </h4>
                  </div>
                </div>
                <div className="flex items-center gap-3 pl-4">
                  <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 shrink-0">
                    <LuBuilding size={20} />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-[10px] font-semibold text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded-full inline-block">
                      Bank
                    </span>
                    <h4 className="text-base font-black text-foreground tracking-tight truncate">
                      {formatCurrency(totalTransfer)}
                    </h4>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Card */}
      <Card className="rounded-3xl overflow-hidden shadow-sm border-border/50">
        <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-border/30 p-6 bg-card">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md w-full">
            <TextField
              placeholder="Cari investor, kas/bank atau keterangan..."
              prefixIcon={LuSearch}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full h-10"
            />
          </div>

          {/* Date Range Picker */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <DateRangePicker
              value={dateRange}
              onChange={setDateRange}
              isClearable
              className="w-full sm:w-[260px] h-10 rounded-xl"
            />
          </div>
        </CardHeader>

        {/* Dynamic Table Content */}
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px] text-center">
                    Tanggal
                  </TableHead>
                  <TableHead>Metode Setoran</TableHead>
                  <TableHead className="text-right">Nominal</TableHead>
                  <TableHead>Keterangan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-24 text-center text-muted-foreground text-xs"
                    >
                      Loading data setoran modal...
                    </TableCell>
                  </TableRow>
                ) : transactionList.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-24 text-center text-muted-foreground text-xs"
                    >
                      Tidak ada data setoran modal.
                    </TableCell>
                  </TableRow>
                ) : (
                  transactionList.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-xs font-medium text-center text-muted-foreground">
                        {item.transactionDate}
                      </TableCell>
                      <TableCell className="text-xs text-foreground">
                        {item.paymentMethod === "cash"
                          ? "Kas Kecil"
                          : item.paymentMethod === "transfer"
                            ? "Bank"
                            : item.paymentMethod}
                      </TableCell>
                      <TableCell className="text-right font-bold text-emerald-600 text-xs">
                        {formatCurrency(item.amount)}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs max-w-xs truncate">
                        {item.description}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <TablePagination
              currentPage={page}
              pageSize={pageSize}
              totalEntries={totalEntries}
              totalPages={totalPages}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          </div>
        </CardContent>
      </Card>

      <CapitalInjectionFormDialog
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleCreate}
      />
    </div>
  );
}

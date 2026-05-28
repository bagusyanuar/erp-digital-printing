import React, { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  createColumnHelper,
} from "@tanstack/react-table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useResellerDI } from "./useResellerDI";
import { toast } from "@erp-digital-printing/ui/Toast";
import { resellerKeys } from "@infrastructure/reseller/keys";
import { Typography } from "@erp-digital-printing/ui/Typography";
import { Button } from "@erp-digital-printing/ui/Button";
import { LuEllipsisVertical } from "@erp-digital-printing/ui/icons";
import type { CreateResellerInput } from "@core/reseller/applications/inputs";
import type { AppError } from "@core/shared/errors/domain.error";

export interface CustomerLevel {
  id: string;
  name: string;
  discount_percentage: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Reseller {
  id: string;
  customer_level_id: string;
  customer_level: CustomerLevel;
  name: string;
  email: string;
  phone: string;
  address: string;
  credit_limit: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

const columnHelper = createColumnHelper<Reseller>();

const formatRupiah = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
};

export const useResellerTable = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const { getResellersUseCase, createResellerUseCase } = useResellerDI();
  const queryClient = useQueryClient();

  // Fetch real data from the API
  const { data: response, isLoading, isFetching } = useQuery({
    queryKey: resellerKeys.list({ limit: 100 }),
    queryFn: () => getResellersUseCase.execute({ limit: 100 }),
  });

  // Map API/core model to representation/view model
  const data = useMemo(() => {
    return (response?.data ?? []).map(
      (model): Reseller => ({
        id: model.id,
        name: model.name,
        email: model.email,
        phone: model.phone,
        address: model.address,
        credit_limit: model.creditLimit,
        customer_level_id: "d2c67ef8-82e4-4d8b-968b-5a1e2f5b6154",
        customer_level: {
          id: "d2c67ef8-82e4-4d8b-968b-5a1e2f5b6154",
          name: "Reseller",
          discount_percentage: 0,
          created_at: "",
          updated_at: "",
          deleted_at: null,
        },
        created_at: "",
        updated_at: "",
        deleted_at: null,
      }),
    );
  }, [response]);

  // Create Reseller Mutation
  const createMutation = useMutation({
    mutationFn: (input: CreateResellerInput) =>
      createResellerUseCase.execute(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resellerKeys.all });
      toast.success(
        "Reseller Berhasil Ditambahkan",
        "Data reseller baru telah disimpan ke dalam sistem.",
      );
      setIsAddDialogOpen(false);
    },
    onError: (error: AppError) => {
      toast.error(
        "Gagal Menambahkan Reseller",
        error.message || "Terjadi kesalahan.",
      );
    },
  });

  const addReseller = (newReseller: CreateResellerInput) => {
    createMutation.mutate(newReseller);
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Nama Reseller",
        cell: (info) => (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 font-black text-sm">
              {info.getValue().charAt(0)}
            </div>
            <div className="flex flex-col">
              <Typography weight="bold" className="text-foreground">
                {info.getValue()}
              </Typography>
              <Typography
                variant="small"
                className="text-muted-foreground text-xs"
              >
                {info.row.original.email}
              </Typography>
            </div>
          </div>
        ),
      }),
      columnHelper.accessor("phone", {
        header: "Nomor Telepon",
        cell: (info) => (
          <span className="text-sm font-medium text-foreground">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("address", {
        header: "Alamat",
        cell: (info) => (
          <span className="text-sm text-muted-foreground line-clamp-1 max-w-[200px]">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("credit_limit", {
        header: "Limit Kredit",
        cell: (info) => (
          <code className="bg-emerald-500/10 dark:bg-emerald-500/20 px-2 py-1 rounded text-xs font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            {formatRupiah(info.getValue())}
          </code>
        ),
      }),
      columnHelper.accessor("customer_level.name", {
        header: "Level",
        cell: (info) => (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/10">
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: "Aksi",
        cell: () => (
          <div className="text-right">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg hover:bg-sidebar-accent"
            >
              <LuEllipsisVertical className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        ),
      }),
    ],
    [],
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
  });

  return {
    table,
    data,
    columns,
    isLoading: isLoading || isFetching,
    isAdding: createMutation.isPending,
    isAddDialogOpen,
    setIsAddDialogOpen,
    globalFilter,
    setGlobalFilter,
    addReseller,
  };
};

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
import {
  LuEllipsisVertical,
  LuPencil,
  LuTrash2,
} from "@erp-digital-printing/ui/icons";
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
} from "@erp-digital-printing/ui/Dropdown";
import type { CreateResellerInput } from "@core/reseller/applications/inputs";
import type { AppError } from "@core/shared/errors/domain.error";
import { useDebounce } from "../../shared/hooks/useDebounce";

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

export const useResellerTable = (options?: {
  onEdit?: (reseller: Reseller) => void;
  onDelete?: (reseller: Reseller) => void;
}) => {
  "use no memo";
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const debouncedSearch = useDebounce(globalFilter, 750);

  // Reset pagination to first page when search changes
  React.useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [debouncedSearch]);

  const {
    getResellersUseCase,
    createResellerUseCase,
    getResellerByIdUseCase,
    updateResellerUseCase,
    deleteResellerUseCase,
  } = useResellerDI();
  const queryClient = useQueryClient();

  const [selectedResellerId, setSelectedResellerId] = useState<string | null>(
    null,
  );

  // Fetch real data from the API with dynamic page, limit, and search parameters
  const {
    data: response,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: resellerKeys.list({
      limit: pagination.pageSize,
      page: pagination.pageIndex + 1,
      search: debouncedSearch || undefined,
    }),
    queryFn: () =>
      getResellersUseCase.execute({
        limit: pagination.pageSize,
        page: pagination.pageIndex + 1,
        search: debouncedSearch || undefined,
      }),
    staleTime: 10_000,
    gcTime: 30_000,
    refetchOnWindowFocus: false,
  });

  // Fetch single reseller details dynamically by ID
  const { data: detailResponse, isFetching: isFetchingDetail } = useQuery({
    queryKey: resellerKeys.detail(selectedResellerId ?? ""),
    queryFn: () => getResellerByIdUseCase.execute(selectedResellerId!),
    enabled: !!selectedResellerId,
    refetchOnWindowFocus: false,
  });

  const resellerDetail = useMemo((): Reseller | null => {
    if (!detailResponse) return null;
    return {
      id: detailResponse.id,
      name: detailResponse.name,
      email: detailResponse.email,
      phone: detailResponse.phone,
      address: detailResponse.address,
      credit_limit: detailResponse.creditLimit,
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
    };
  }, [detailResponse]);

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

  // Update Reseller Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: CreateResellerInput }) =>
      updateResellerUseCase.execute(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resellerKeys.all });
      toast.success(
        "Reseller Berhasil Diperbarui",
        "Data reseller telah berhasil diperbarui di dalam sistem.",
      );
    },
    onError: (error: AppError) => {
      toast.error(
        "Gagal Memperbarui Reseller",
        error.message || "Terjadi kesalahan.",
      );
    },
  });

  // Delete Reseller Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteResellerUseCase.execute(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resellerKeys.all });
      toast.success(
        "Reseller Berhasil Dihapus",
        "Data reseller telah berhasil dihapus dari sistem.",
      );
    },
    onError: (error: AppError) => {
      toast.error(
        "Gagal Menghapus Reseller",
        error.message || "Terjadi kesalahan.",
      );
    },
  });

  const addReseller = (newReseller: CreateResellerInput) => {
    createMutation.mutate(newReseller);
  };

  const openEditDialog = (reseller: Reseller) => {
    options?.onEdit?.(reseller);
  };

  const openDeleteDialog = (reseller: Reseller) => {
    options?.onDelete?.(reseller);
  };

  const updateReseller = (
    id: string,
    input: CreateResellerInput,
    onSuccess?: () => void,
  ) => {
    updateMutation.mutate(
      { id, input },
      {
        onSuccess: () => {
          onSuccess?.();
        },
      },
    );
  };

  const deleteReseller = (id: string, onSuccess?: () => void) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        onSuccess?.();
      },
    });
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
        cell: (info) => (
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
              <DropdownContent align="end" className="w-36">
                <DropdownItem onClick={() => openEditDialog(info.row.original)}>
                  <LuPencil className="h-3.5 w-3.5 text-blue-600" />
                  <span>Ubah</span>
                </DropdownItem>
                <DropdownItem
                  variant="danger"
                  onClick={() => openDeleteDialog(info.row.original)}
                >
                  <LuTrash2 className="h-3.5 w-3.5 text-rose-600" />
                  <span>Hapus</span>
                </DropdownItem>
              </DropdownContent>
            </Dropdown>
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
      pagination,
    },
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true,
    manualFiltering: true,
    pageCount: Math.ceil((response?.total ?? 0) / pagination.pageSize),
  });

  return {
    table,
    data,
    columns,
    isLoading: isLoading || isFetching,
    isAdding: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isAddDialogOpen,
    setIsAddDialogOpen,
    globalFilter,
    setGlobalFilter,
    addReseller,
    updateReseller,
    deleteReseller,
    selectedResellerId,
    setSelectedResellerId,
    isFetchingDetail,
    resellerDetail,
    totalEntries: response?.total ?? 0,
  };
};

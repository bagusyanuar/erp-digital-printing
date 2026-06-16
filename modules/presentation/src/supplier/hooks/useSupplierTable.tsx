import React, { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  createColumnHelper,
} from "@tanstack/react-table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupplierDI } from "./useSupplierDI";
import { toast } from "@erp-digital-printing/ui/Toast";
import { supplierKeys } from "@infrastructure/supplier/keys";
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
import type { CreateSupplierInput } from "@core/supplier/applications/inputs";
import type { AppError } from "@core/shared/errors/domain.error";
import { useDebounce } from "../../shared/hooks/useDebounce";

export interface Supplier {
  id: string;
  name: string;
  contact_name: string;
  phone: string;
  email: string;
  address: string;
  created_at: string;
}

const columnHelper = createColumnHelper<Supplier>();

export const useSupplierTable = (options?: {
  onEdit?: (supplier: Supplier) => void;
  onDelete?: (supplier: Supplier) => void;
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
    getSuppliersUseCase,
    createSupplierUseCase,
    getSupplierByIdUseCase,
    updateSupplierUseCase,
    deleteSupplierUseCase,
  } = useSupplierDI();
  const queryClient = useQueryClient();

  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(
    null,
  );

  // Fetch real data from the API
  const {
    data: response,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: supplierKeys.list({
      limit: pagination.pageSize,
      page: pagination.pageIndex + 1,
      search: debouncedSearch || undefined,
    }),
    queryFn: () =>
      getSuppliersUseCase.execute({
        limit: pagination.pageSize,
        page: pagination.pageIndex + 1,
        search: debouncedSearch || undefined,
      }),
    staleTime: 10_000,
    gcTime: 30_000,
    refetchOnWindowFocus: false,
  });

  // Fetch single supplier details dynamically by ID
  const { data: detailResponse, isFetching: isFetchingDetail } = useQuery({
    queryKey: supplierKeys.detail(selectedSupplierId ?? ""),
    queryFn: () => getSupplierByIdUseCase.execute(selectedSupplierId!),
    enabled: !!selectedSupplierId,
    refetchOnWindowFocus: false,
  });

  const supplierDetail = useMemo((): Supplier | null => {
    if (!detailResponse) return null;
    return {
      id: detailResponse.id,
      name: detailResponse.name,
      contact_name: detailResponse.contactName,
      phone: detailResponse.phone,
      email: detailResponse.email,
      address: detailResponse.address,
      created_at: detailResponse.createdAt,
    };
  }, [detailResponse]);

  // Map core model to representation view model
  const data = useMemo(() => {
    return (response?.data ?? []).map(
      (model): Supplier => ({
        id: model.id,
        name: model.name,
        contact_name: model.contactName,
        phone: model.phone,
        email: model.email,
        address: model.address,
        created_at: model.createdAt,
      }),
    );
  }, [response]);

  // Create Supplier Mutation
  const createMutation = useMutation({
    mutationFn: (input: CreateSupplierInput) =>
      createSupplierUseCase.execute(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supplierKeys.all });
      toast.success(
        "Supplier Berhasil Ditambahkan",
        "Data supplier baru telah disimpan ke dalam sistem.",
      );
      setIsAddDialogOpen(false);
    },
    onError: (error: AppError) => {
      toast.error(
        "Gagal Menambahkan Supplier",
        error.message || "Terjadi kesalahan.",
      );
    },
  });

  // Update Supplier Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: CreateSupplierInput }) =>
      updateSupplierUseCase.execute(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supplierKeys.all });
      toast.success(
        "Supplier Berhasil Diperbarui",
        "Data supplier telah berhasil diperbarui di dalam sistem.",
      );
    },
    onError: (error: AppError) => {
      toast.error(
        "Gagal Memperbarui Supplier",
        error.message || "Terjadi kesalahan.",
      );
    },
  });

  // Delete Supplier Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteSupplierUseCase.execute(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supplierKeys.all });
      toast.success(
        "Supplier Berhasil Dihapus",
        "Data supplier telah berhasil dihapus dari sistem.",
      );
    },
    onError: (error: AppError) => {
      toast.error(
        "Gagal Menghapus Supplier",
        error.message || "Terjadi kesalahan.",
      );
    },
  });

  const addSupplier = (newSupplier: CreateSupplierInput) => {
    createMutation.mutate(newSupplier);
  };

  const openEditDialog = (supplier: Supplier) => {
    options?.onEdit?.(supplier);
  };

  const openDeleteDialog = (supplier: Supplier) => {
    options?.onDelete?.(supplier);
  };

  const updateSupplier = (
    id: string,
    input: CreateSupplierInput,
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

  const deleteSupplier = (id: string, onSuccess?: () => void) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        onSuccess?.();
      },
    });
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Nama Supplier",
        cell: (info) => (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-sm">
              {info.getValue().charAt(0)}
            </div>
            <div className="flex flex-col">
              <Typography weight="bold" className="text-foreground">
                {info.getValue()}
              </Typography>
              <Typography variant="small" className="text-muted-foreground text-xs">
                PIC: {info.row.original.contact_name}
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
      columnHelper.accessor("email", {
        header: "Email",
        cell: (info) => (
          <span className="text-sm text-foreground">
            {info.getValue() || "-"}
          </span>
        ),
      }),
      columnHelper.accessor("address", {
        header: "Alamat Kantor",
        cell: (info) => (
          <span className="text-sm text-muted-foreground line-clamp-1 max-w-[250px]">
            {info.getValue()}
          </span>
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
    addSupplier,
    updateSupplier,
    deleteSupplier,
    selectedSupplierId,
    setSelectedSupplierId,
    isFetchingDetail,
    supplierDetail,
    totalEntries: response?.total ?? 0,
  };
};

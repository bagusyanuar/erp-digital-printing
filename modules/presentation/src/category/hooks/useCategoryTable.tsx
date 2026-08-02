import React, { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  createColumnHelper,
} from "@tanstack/react-table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCategoryDI } from "./useCategoryDI";
import { toast } from "@erp-digital-printing/ui/Toast";
import { categoryKeys } from "@infrastructure/category/keys";
import { Button } from "@erp-digital-printing/ui/Button";
import { TextField } from "@erp-digital-printing/ui/TextField";
import {
  LuEllipsisVertical,
  LuPencil,
  LuTrash2,
  LuArrowUp,
  LuArrowDown,
  LuHash,
} from "@erp-digital-printing/ui/icons";
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
} from "@erp-digital-printing/ui/Dropdown";
import type { CreateCategoryInput } from "@core/category/applications/inputs";
import type { AppError } from "@core/shared/errors/domain.error";
import { useDebounce } from "../../shared/hooks/useDebounce";

export interface Category {
  id: string;
  name: string;
  sequence?: number;
}

const columnHelper = createColumnHelper<Category>();

export const useCategoryTable = (options?: {
  onEdit?: (category: Category) => void;
  onDelete?: (category: Category) => void;
  onChangeSequence?: (category: Category) => void;
}) => {
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
    getCategoriesUseCase,
    createCategoryUseCase,
    updateCategoryUseCase,
    deleteCategoryUseCase,
    reorderCategoryUseCase,
  } = useCategoryDI();
  const queryClient = useQueryClient();

  // Fetch real data from the API with dynamic page, limit, and search parameters
  const {
    data: response,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: categoryKeys.list({
      limit: pagination.pageSize,
      page: pagination.pageIndex + 1,
      search: debouncedSearch || undefined,
    }),
    queryFn: () =>
      getCategoriesUseCase.execute({
        limit: pagination.pageSize,
        page: pagination.pageIndex + 1,
        search: debouncedSearch || undefined,
      }),
    staleTime: 10_000,
    gcTime: 30_000,
    refetchOnWindowFocus: false,
  });

  // Map API/core model to representation/view model
  const data = useMemo(() => {
    return (response?.data ?? []).map(
      (model): Category => ({
        id: model.id,
        name: model.name,
        sequence: model.sequence ?? 0,
      }),
    );
  }, [response]);

  // Create Category Mutation
  const createMutation = useMutation({
    mutationFn: (input: CreateCategoryInput) =>
      createCategoryUseCase.execute(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      toast.success(
        "Kategori Berhasil Ditambahkan",
        "Kategori produk baru telah berhasil disimpan ke sistem.",
      );
      setIsAddDialogOpen(false);
    },
    onError: (error: AppError) => {
      toast.error(
        "Gagal Menambahkan Kategori",
        error.message || "Terjadi kesalahan.",
      );
    },
  });

  // Update Category Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: CreateCategoryInput }) =>
      updateCategoryUseCase.execute(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      toast.success(
        "Kategori Berhasil Diperbarui",
        "Data kategori telah berhasil diperbarui di dalam sistem.",
      );
    },
    onError: (error: AppError) => {
      toast.error(
        "Gagal Memperbarui Kategori",
        error.message || "Terjadi kesalahan.",
      );
    },
  });

  // Delete Category Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCategoryUseCase.execute(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      toast.success(
        "Kategori Berhasil Dihapus",
        "Data kategori telah berhasil dihapus dari sistem.",
      );
    },
    onError: (error: AppError) => {
      toast.error(
        "Gagal Menghapus Kategori",
        error.message || "Terjadi kesalahan.",
      );
    },
  });

  // Reorder Category Mutation
  const reorderMutation = useMutation({
    mutationFn: (input: { items: { id: string; sequence: number }[] }) =>
      reorderCategoryUseCase.execute(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      toast.success(
        "Urutan Berhasil Diperbarui",
        "Urutan kategori telah berhasil disimpan.",
      );
    },
    onError: (error: AppError) => {
      toast.error(
        "Gagal Memperbarui Urutan",
        error.message || "Terjadi kesalahan.",
      );
    },
  });

  const addCategory = (name: string) => {
    createMutation.mutate({ name });
  };

  const updateCategory = (id: string, name: string, onSuccess?: () => void) => {
    updateMutation.mutate(
      { id, input: { name } },
      {
        onSuccess: () => {
          onSuccess?.();
        },
      },
    );
  };

  const deleteCategory = (id: string, onSuccess?: () => void) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        onSuccess?.();
      },
    });
  };

  const reorderCategories = (items: { id: string; sequence: number }[], onSuccess?: () => void) => {
    reorderMutation.mutate(
      { items },
      {
        onSuccess: () => {
          onSuccess?.();
        },
      }
    );
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const current = data[index];
    const above = data[index - 1];

    if (!current || !above) return;

    reorderCategories([
      { id: current.id, sequence: above.sequence ?? 0 },
      { id: above.id, sequence: current.sequence ?? 0 },
    ]);
  };

  const handleMoveDown = (index: number) => {
    if (index >= data.length - 1) return;
    const current = data[index];
    const below = data[index + 1];

    if (!current || !below) return;

    reorderCategories([
      { id: current.id, sequence: below.sequence ?? 0 },
      { id: below.id, sequence: current.sequence ?? 0 },
    ]);
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Nama Kategori",
        cell: (info) => (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-sm flex-shrink-0">
              {info.getValue().charAt(0)}
            </div>
            <span className="font-bold text-foreground text-sm leading-none">
              {info.getValue()}
            </span>
          </div>
        ),
      }),
      columnHelper.accessor("sequence", {
        header: "Urutan",
        cell: (info) => (
          <span className="font-semibold text-sm text-foreground/80">
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
              <DropdownContent align="end" className="w-48">
                <DropdownItem
                  onClick={() => handleMoveUp(info.row.index)}
                  disabled={info.row.index === 0}
                >
                  <LuArrowUp className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Pindah Atas</span>
                </DropdownItem>
                <DropdownItem
                  onClick={() => handleMoveDown(info.row.index)}
                  disabled={info.row.index === data.length - 1}
                >
                  <LuArrowDown className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Pindah Bawah</span>
                </DropdownItem>
                <DropdownItem
                  onClick={() => options?.onChangeSequence?.(info.row.original)}
                >
                  <LuHash className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Ubah Urutan...</span>
                </DropdownItem>
                <DropdownItem
                  onClick={() => options?.onEdit?.(info.row.original)}
                >
                  <LuPencil className="h-3.5 w-3.5 text-blue-600" />
                  <span>Ubah</span>
                </DropdownItem>
                <DropdownItem
                  variant="danger"
                  onClick={() => options?.onDelete?.(info.row.original)}
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
    [options],
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
    isReordering: reorderMutation.isPending,
    isAddDialogOpen,
    setIsAddDialogOpen,
    globalFilter,
    setGlobalFilter,
    addCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
    totalEntries: response?.total ?? 0,
  };
};

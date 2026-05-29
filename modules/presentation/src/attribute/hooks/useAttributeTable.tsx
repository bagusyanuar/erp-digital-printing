import React, { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  createColumnHelper,
} from "@tanstack/react-table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAttributeDI } from "./useAttributeDI";
import { toast } from "@erp-digital-printing/ui/Toast";
import { attributeKeys } from "@infrastructure/attribute/keys";
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
import type { CreateAttributeInput } from "@core/attribute/applications/inputs";
import type { AppError } from "@core/shared/errors/domain.error";
import { useDebounce } from "../../shared/hooks/useDebounce";

export interface Attribute {
  id: string;
  name: string;
  value_type: string;
  options?: string[];
}

const columnHelper = createColumnHelper<Attribute>();

export const useAttributeTable = (options?: {
  onEdit?: (attribute: Attribute) => void;
  onDelete?: (attribute: Attribute) => void;
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
    getAttributesUseCase,
    createAttributeUseCase,
    updateAttributeUseCase,
    deleteAttributeUseCase,
  } = useAttributeDI();
  const queryClient = useQueryClient();

  // Fetch real data from the API with dynamic page, limit, and search parameters
  const {
    data: response,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: attributeKeys.list({
      limit: pagination.pageSize,
      page: pagination.pageIndex + 1,
      search: debouncedSearch || undefined,
    }),
    queryFn: () =>
      getAttributesUseCase.execute({
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
      (model): Attribute => ({
        id: model.id,
        name: model.name,
        value_type: model.value_type,
        options: model.options,
      }),
    );
  }, [response]);

  // Create Attribute Mutation
  const createMutation = useMutation({
    mutationFn: (input: CreateAttributeInput) =>
      createAttributeUseCase.execute(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attributeKeys.all });
      toast.success(
        "Atribut Berhasil Ditambahkan",
        "Atribut baru telah berhasil disimpan ke sistem."
      );
      setIsAddDialogOpen(false);
    },
    onError: (error: AppError) => {
      toast.error(
        "Gagal Menambahkan Atribut",
        error.message || "Terjadi kesalahan."
      );
    },
  });

  // Update Attribute Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: CreateAttributeInput }) =>
      updateAttributeUseCase.execute(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attributeKeys.all });
      toast.success(
        "Atribut Berhasil Diperbarui",
        "Data atribut telah berhasil diperbarui di dalam sistem."
      );
    },
    onError: (error: AppError) => {
      toast.error(
        "Gagal Memperbarui Atribut",
        error.message || "Terjadi kesalahan."
      );
    },
  });

  // Delete Attribute Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAttributeUseCase.execute(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attributeKeys.all });
      toast.success(
        "Atribut Berhasil Dihapus",
        "Data atribut telah berhasil dihapus dari sistem."
      );
    },
    onError: (error: AppError) => {
      toast.error(
        "Gagal Menghapus Atribut",
        error.message || "Terjadi kesalahan."
      );
    },
  });

  const addAttribute = (name: string, valueType: string, optionsList?: string[]) => {
    createMutation.mutate({ name, value_type: valueType, options: optionsList });
  };

  const updateAttribute = (
    id: string,
    name: string,
    valueType: string,
    optionsList?: string[],
    onSuccess?: () => void
  ) => {
    updateMutation.mutate(
      { id, input: { name, value_type: valueType, options: optionsList } },
      {
        onSuccess: () => {
          onSuccess?.();
        },
      }
    );
  };

  const deleteAttribute = (id: string, onSuccess?: () => void) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        onSuccess?.();
      },
    });
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Nama Atribut",
        cell: (info) => (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-sm flex-shrink-0">
              {info.getValue().charAt(0).toUpperCase()}
            </div>
            <span className="font-bold text-foreground text-sm leading-none">
              {info.getValue()}
            </span>
          </div>
        ),
      }),
      columnHelper.accessor("options", {
        header: "Pilihan Nilai",
        cell: (info) => {
          const options = info.getValue() || [];
          if (options.length === 0) {
            return (
              <span className="text-xs text-muted-foreground italic font-medium">
                Teks Bebas (Tidak ada opsi)
              </span>
            );
          }
          return (
            <div className="flex flex-wrap gap-1.5 max-w-sm">
              {options.slice(0, 3).map((opt, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-muted text-muted-foreground border border-border/50"
                >
                  {opt}
                </span>
              ))}
              {options.length > 3 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-primary/10 text-primary border border-primary/20">
                  +{options.length - 3} lagi
                </span>
              )}
            </div>
          );
        },
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
                <DropdownItem onClick={() => options?.onEdit?.(info.row.original)}>
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
    [options]
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
    addAttribute,
    updateAttribute,
    deleteAttribute,
    totalEntries: response?.total ?? 0,
  };
};

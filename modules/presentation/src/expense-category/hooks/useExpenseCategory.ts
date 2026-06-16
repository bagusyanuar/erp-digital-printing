import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useExpenseCategoryDI } from "./useExpenseCategoryDI";
import { useCategoryDI } from "../../category/hooks/useCategoryDI";
import { toast } from "@erp-digital-printing/ui/Toast";
import { expenseCategoryKeys } from "@infrastructure/expense-category/keys";
import { categoryKeys } from "@infrastructure/category/keys";
import type { CreateExpenseCategoryInput } from "@core/expense-category/applications/inputs";
import type { AppError } from "@core/shared/errors/domain.error";

export const useExpenseCategory = (
  searchQuery: string,
  selectedGroupFilter: "ALL" | "OPERATIONAL" | "PRODUCTION",
  page: number,
  limit: number
) => {
  const queryClient = useQueryClient();
  const {
    getExpenseCategoriesUseCase,
    createExpenseCategoryUseCase,
    updateExpenseCategoryUseCase,
    deleteExpenseCategoryUseCase,
  } = useExpenseCategoryDI();

  const { getCategoriesUseCase } = useCategoryDI();

  // Query untuk Kategori Pengeluaran
  const expenseCategoriesQuery = useQuery({
    queryKey: expenseCategoryKeys.list({
      search: searchQuery || undefined,
      group: selectedGroupFilter,
      page,
      limit,
    }),
    queryFn: () =>
      getExpenseCategoriesUseCase.execute({
        search: searchQuery || undefined,
        group: selectedGroupFilter,
        page,
        limit,
      }),
    staleTime: 10_000,
    gcTime: 30_000,
    refetchOnWindowFocus: false,
  });

  // Query untuk Kategori Produk (maksimal limit 100 agar terambil semua kategori untuk dropdown)
  const productCategoriesQuery = useQuery({
    queryKey: categoryKeys.list({ limit: 100 }),
    queryFn: () => getCategoriesUseCase.execute({ limit: 100 }),
    staleTime: 60_000,
    gcTime: 120_000,
    refetchOnWindowFocus: false,
  });

  // Mutation: Create
  const createMutation = useMutation({
    mutationFn: (input: CreateExpenseCategoryInput) =>
      createExpenseCategoryUseCase.execute(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseCategoryKeys.all });
      toast.success(
        "Kategori Pengeluaran Berhasil Ditambahkan",
        "Kategori pengeluaran baru telah berhasil disimpan ke sistem."
      );
    },
    onError: (error: AppError) => {
      toast.error(
        "Gagal Menambahkan Kategori Pengeluaran",
        error.message || "Terjadi kesalahan saat menyimpan data."
      );
    },
  });

  // Mutation: Update
  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: CreateExpenseCategoryInput }) =>
      updateExpenseCategoryUseCase.execute(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseCategoryKeys.all });
      toast.success(
        "Kategori Pengeluaran Berhasil Diperbarui",
        "Data kategori pengeluaran telah berhasil diperbarui."
      );
    },
    onError: (error: AppError) => {
      toast.error(
        "Gagal Memperbarui Kategori Pengeluaran",
        error.message || "Terjadi kesalahan saat memperbarui data."
      );
    },
  });

  // Mutation: Delete
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteExpenseCategoryUseCase.execute(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseCategoryKeys.all });
      toast.success(
        "Kategori Pengeluaran Berhasil Dihapus",
        "Kategori pengeluaran telah berhasil dihapus dari sistem."
      );
    },
    onError: (error: AppError) => {
      toast.error(
        "Gagal Menghapus Kategori Pengeluaran",
        error.message || "Terjadi kesalahan saat menghapus data."
      );
    },
  });

  return {
    expenseCategories: expenseCategoriesQuery.data?.data ?? [],
    productCategories: productCategoriesQuery.data?.data ?? [],
    totalEntries: expenseCategoriesQuery.data?.total ?? 0,
    totalPages: Math.ceil((expenseCategoriesQuery.data?.total ?? 0) / limit),
    isLoadingExpense: expenseCategoriesQuery.isLoading || expenseCategoriesQuery.isFetching,
    isLoadingProduct: productCategoriesQuery.isLoading,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    createExpenseCategory: createMutation.mutateAsync,
    updateExpenseCategory: updateMutation.mutateAsync,
    deleteExpenseCategory: deleteMutation.mutateAsync,
  };
};

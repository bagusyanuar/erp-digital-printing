import React, { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  createColumnHelper,
} from "@tanstack/react-table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUserDI } from "./useUserDI";
import { toast } from "@erp-digital-printing/ui/Toast";
import { userKeys } from "@infrastructure/user/keys/user.key";
import { Typography } from "@erp-digital-printing/ui/Typography";
import { Badge } from "@erp-digital-printing/ui/Badge";
import type { UserModel, RoleModel } from "@core/user/domains/models/user.model";
import type { CreateUserInput } from "@core/user/domains/repositories/user.repository";
import type { AppError } from "@core/shared/errors/domain.error";

const columnHelper = createColumnHelper<UserModel>();

export const useUserTable = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const { getUsersUseCase, createUserUseCase, getRolesUseCase } = useUserDI();
  const queryClient = useQueryClient();

  const {
    data: users = [],
    isLoading,
    isFetching,
  } = useQuery<UserModel[]>({
    queryKey: userKeys.lists(),
    queryFn: () => getUsersUseCase.execute(),
    staleTime: 10_000,
    gcTime: 30_000,
    refetchOnWindowFocus: false,
  });

  const { data: roles = [] } = useQuery<RoleModel[]>({
    queryKey: userKeys.roles(),
    queryFn: () => getRolesUseCase.execute(),
    staleTime: 60_000,
    gcTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const createMutation = useMutation<UserModel, AppError, CreateUserInput>({
    mutationFn: (input: CreateUserInput) => createUserUseCase.execute(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      toast.success("User berhasil ditambahkan");
      setIsAddDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.message || "Gagal menambahkan user");
    },
  });

  const columns = useMemo(
    () => [
      columnHelper.accessor("username", {
        header: "Username",
        cell: (info) => (
          <Typography variant="small" className="font-semibold text-foreground">
            {info.getValue()}
          </Typography>
        ),
      }),
      columnHelper.accessor("roles", {
        header: "Role / Akses",
        cell: (info) => {
          const roles = info.getValue();
          if (!roles || roles.length === 0) {
            return <span className="text-muted-foreground text-sm">-</span>;
          }
          return (
            <div className="flex flex-wrap gap-1">
              {roles.map((role) => (
                <Badge key={role.id} variant="secondary">
                  {role.name}
                </Badge>
              ))}
            </div>
          );
        },
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: users,
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

  return {
    table,
    isLoading,
    isFetching,
    globalFilter,
    setGlobalFilter,
    isAddDialogOpen,
    setIsAddDialogOpen,
    createUser: createMutation.mutate,
    isCreating: createMutation.isPending,
    roles,
  };
};

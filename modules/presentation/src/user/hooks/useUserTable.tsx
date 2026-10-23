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
import { Button } from "@erp-digital-printing/ui/Button";
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
} from "@erp-digital-printing/ui/Dropdown";
import {
  LuEllipsisVertical,
  LuPencil,
  LuKey,
  LuTrash2,
} from "@erp-digital-printing/ui/icons";
import type { UserModel, RoleModel } from "@core/user/domains/models/user.model";
import type {
  CreateUserInput,
  UpdateUserInput,
  ChangeUserPasswordInput,
} from "@core/user/domains/repositories/user.repository";
import type { AppError } from "@core/shared/errors/domain.error";

const columnHelper = createColumnHelper<UserModel>();

export interface UseUserTableOptions {
  onEdit?: (user: UserModel) => void;
  onChangePassword?: (user: UserModel) => void;
  onDelete?: (user: UserModel) => void;
}

export const useUserTable = (options?: UseUserTableOptions) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserModel | null>(null);

  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const {
    getUsersUseCase,
    createUserUseCase,
    updateUserUseCase,
    changeUserPasswordUseCase,
    deleteUserUseCase,
    getRolesUseCase,
  } = useUserDI();
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

  const updateMutation = useMutation<UserModel, AppError, UpdateUserInput>({
    mutationFn: (input: UpdateUserInput) => updateUserUseCase.execute(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      toast.success("User berhasil diperbarui");
      setIsEditDialogOpen(false);
      setSelectedUser(null);
    },
    onError: (error) => {
      toast.error(error.message || "Gagal memperbarui user");
    },
  });

  const changePasswordMutation = useMutation<UserModel, AppError, ChangeUserPasswordInput>({
    mutationFn: (input: ChangeUserPasswordInput) =>
      changeUserPasswordUseCase.execute(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      toast.success("Password user berhasil diubah");
      setIsChangePasswordDialogOpen(false);
      setSelectedUser(null);
    },
    onError: (error) => {
      toast.error(error.message || "Gagal mengubah password");
    },
  });

  const deleteMutation = useMutation<void, AppError, string>({
    mutationFn: (id: string) => deleteUserUseCase.execute(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      toast.success("User berhasil dihapus");
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
    },
    onError: (error) => {
      toast.error(error.message || "Gagal menghapus user");
    },
  });

  const handleEdit = (user: UserModel) => {
    setSelectedUser(user);
    if (options?.onEdit) {
      options.onEdit(user);
    } else {
      setIsEditDialogOpen(true);
    }
  };

  const handleChangePassword = (user: UserModel) => {
    setSelectedUser(user);
    if (options?.onChangePassword) {
      options.onChangePassword(user);
    } else {
      setIsChangePasswordDialogOpen(true);
    }
  };

  const handleDelete = (user: UserModel) => {
    setSelectedUser(user);
    if (options?.onDelete) {
      options.onDelete(user);
    } else {
      setIsDeleteDialogOpen(true);
    }
  };

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
          const userRoles = info.getValue();
          if (!userRoles || userRoles.length === 0) {
            return <span className="text-muted-foreground text-sm">-</span>;
          }
          return (
            <div className="flex flex-wrap gap-1">
              {userRoles.map((role) => (
                <Badge key={role.id} variant="secondary">
                  {role.name}
                </Badge>
              ))}
            </div>
          );
        },
      }),
      columnHelper.display({
        id: "actions",
        header: () => <div className="text-right">Aksi</div>,
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
              <DropdownContent align="end" className="w-44">
                <DropdownItem onClick={() => handleEdit(info.row.original)}>
                  <LuPencil className="h-3.5 w-3.5 text-blue-600" />
                  <span>Edit</span>
                </DropdownItem>
                <DropdownItem onClick={() => handleChangePassword(info.row.original)}>
                  <LuKey className="h-3.5 w-3.5 text-amber-600" />
                  <span>Ganti Password</span>
                </DropdownItem>
                <DropdownItem
                  variant="danger"
                  onClick={() => handleDelete(info.row.original)}
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
    isEditDialogOpen,
    setIsEditDialogOpen,
    isChangePasswordDialogOpen,
    setIsChangePasswordDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    selectedUser,
    setSelectedUser,
    createUser: createMutation.mutate,
    isCreating: createMutation.isPending,
    updateUser: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    changePassword: changePasswordMutation.mutate,
    isChangingPassword: changePasswordMutation.isPending,
    deleteUser: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    roles,
  };
};

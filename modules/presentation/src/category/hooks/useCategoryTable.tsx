import React, { useState } from 'react';
import { 
  useReactTable, 
  getCoreRowModel, 
  getPaginationRowModel, 
  createColumnHelper
} from "@tanstack/react-table";
import { Typography } from "@erp-digital-printing/ui/Typography";
import { Button } from "@erp-digital-printing/ui/Button";
import { LuEllipsisVertical } from "@erp-digital-printing/ui/icons";

export interface Category {
  id: number;
  name: string;
  code: string;
  totalProducts: number;
  status: string;
}

const columnHelper = createColumnHelper<Category>();

export const useCategoryTable = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Dummy Data yang relevan dengan Digital Printing
  const [data] = useState<Category[]>([
    { id: 1, name: "Large Format", code: "CAT-LF", totalProducts: 45, status: "Active" },
    { id: 2, name: "Sticker & Label", code: "CAT-SL", totalProducts: 128, status: "Active" },
    { id: 3, name: "Indoor/Outdoor", code: "CAT-IO", totalProducts: 32, status: "Active" },
    { id: 4, name: "Merchandise", code: "CAT-MC", totalProducts: 12, status: "Inactive" },
    { id: 5, name: "Finishing Service", code: "CAT-FS", totalProducts: 8, status: "Active" },
    { id: 6, name: "Digital Press", code: "CAT-DP", totalProducts: 72, status: "Active" },
    { id: 7, name: "Offset Printing", code: "CAT-OP", totalProducts: 15, status: "Active" },
    { id: 8, name: "Textile Printing", code: "CAT-TP", totalProducts: 24, status: "Inactive" },
    { id: 9, name: "Binding & Craft", code: "CAT-BC", totalProducts: 5, status: "Active" },
    { id: 10, name: "Laser Cutting", code: "CAT-LC", totalProducts: 18, status: "Active" },
    { id: 11, name: "UV Printing", code: "CAT-UV", totalProducts: 9, status: "Active" },
  ]);

  const columns = [
    columnHelper.accessor("name", {
      header: "Info Kategori",
      cell: info => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-sm">
            {info.getValue().charAt(0)}
          </div>
          <Typography weight="bold" className="group-hover:text-primary transition-colors">{info.getValue()}</Typography>
        </div>
      ),
    }),
    columnHelper.accessor("code", {
      header: "ID / Kode",
      cell: info => (
        <code className="bg-muted px-2 py-1 rounded text-[11px] font-bold text-muted-foreground border border-border/50">
          {info.getValue()}
        </code>
      ),
    }),
    columnHelper.accessor("totalProducts", {
      header: "Total Produk",
      cell: info => (
        <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-sidebar-accent text-[10px] font-black text-muted-foreground uppercase">
          {info.getValue()} Item
        </span>
      ),
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: info => {
        const isActive = info.getValue() === "Active";
        return (
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
            isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
          }`}>
            <div className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            {info.getValue()}
          </div>
        );
      },
    }),
    columnHelper.display({
      id: "actions",
      header: "Aksi",
      cell: () => (
        <div className="text-right">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-sidebar-accent">
            <LuEllipsisVertical className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      ),
    }),
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
  });

  return {
    table,
    data,
    isAddDialogOpen,
    setIsAddDialogOpen
  };
};

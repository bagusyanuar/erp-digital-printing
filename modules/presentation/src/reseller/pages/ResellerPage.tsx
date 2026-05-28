import React, { useState } from "react";
import { Button } from "@erp-digital-printing/ui/Button";
import { TextField } from "@erp-digital-printing/ui/TextField";
import { Typography } from "@erp-digital-printing/ui/Typography";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@erp-digital-printing/ui/Card";
import { Dialog } from "@erp-digital-printing/ui/Dialog";
import { Label } from "@erp-digital-printing/ui/Label";
import { toast } from "@erp-digital-printing/ui/Toast";
import { 
  LuPlus, LuSearch, LuFilter, LuBriefcase, LuX
} from "@erp-digital-printing/ui/icons";
import { flexRender } from "@tanstack/react-table";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell,
  TablePagination
} from "@erp-digital-printing/ui/Table";
import { useResellerTable } from "../hooks/useResellerTable";

const ResellerPage = () => {
  const { 
    table,
    columns,
    isLoading,
    isAddDialogOpen, 
    setIsAddDialogOpen, 
    globalFilter, 
    setGlobalFilter,
    addReseller 
  } = useResellerTable();

  // State Form untuk reseller baru
  const [newResellerName, setNewResellerName] = useState("");
  const [newResellerEmail, setNewResellerEmail] = useState("");
  const [newResellerPhone, setNewResellerPhone] = useState("");
  const [newResellerAddress, setNewResellerAddress] = useState("");
  const [newResellerCreditLimit, setNewResellerCreditLimit] = useState(0);

  const handleSaveReseller = () => {
    if (!newResellerName.trim()) {
      toast.error("Nama wajib diisi", "Silakan masukkan nama reseller/biro terlebih dahulu.");
      return;
    }

    addReseller({
      name: newResellerName,
      email: newResellerEmail,
      phone: newResellerPhone,
      address: newResellerAddress,
      credit_limit: Number(newResellerCreditLimit) || 0,
    });

    // Reset Form
    setNewResellerName("");
    setNewResellerEmail("");
    setNewResellerPhone("");
    setNewResellerAddress("");
    setNewResellerCreditLimit(0);
    setIsAddDialogOpen(false);

    toast.success("Reseller Berhasil Ditambahkan", "Data reseller baru telah disimpan ke dalam sistem.");
  };

  return (
    <div className="p-6 space-y-8 font-sans bg-background min-h-screen animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
            <LuBriefcase className="text-primary" size={32} />
            Biro / Reseller
          </h1>
          <p className="text-muted-foreground font-medium">
            Kelola mitra biro dan reseller pencetakan beserta limit kredit plafon transaksi mereka.
          </p>
        </div>
      </div>

      {/* Main Table Card */}
      <Card className="rounded-3xl overflow-hidden shadow-sm border-border/50">
        <CardHeader className="flex flex-row items-center justify-between gap-4 border-b border-border/30 p-6 bg-card">
          {/* Search Input */}
          <div className="flex-1 max-w-md">
            <TextField 
              placeholder="Cari reseller berdasarkan nama atau kontak..." 
              prefixIcon={LuSearch}
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              className="h-10 px-4 rounded-xl font-bold border-border/50 hover:bg-muted transition-all flex items-center gap-2"
            >
              <LuFilter size={18} />
              Filter
            </Button>
            <Button 
              className="h-10 px-4 rounded-xl font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
              onClick={() => setIsAddDialogOpen(true)}
            >
              <LuPlus size={18} />
              Tambah Mitra
            </Button>
          </div>
        </CardHeader>

        {/* Table Body */}
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <TableHead key={header.id} className={header.column.id === "actions" ? "text-center" : ""}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center py-10 text-muted-foreground animate-pulse">
                    Memuat data mitra reseller...
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map(row => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center py-10 text-muted-foreground">
                    Tidak ada data reseller ditemukan.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>

        {/* Pagination */}
        <TablePagination
          currentPage={table.getState().pagination.pageIndex + 1}
          totalPages={table.getPageCount()}
          pageSize={table.getState().pagination.pageSize}
          totalEntries={table.getFilteredRowModel().rows.length}
          onPageChange={(page) => table.setPageIndex(page - 1)}
          onPageSizeChange={(size) => table.setPageSize(size)}
        />
      </Card>

      {/* Add Reseller Dialog */}
      <Dialog isOpen={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)} size="md" showCloseButton={false}>
        <CardHeader className="px-6 py-4 border-b border-border/50 flex flex-row items-start justify-between gap-4">
          <div className="space-y-0.5">
            <CardTitle variant="h4" weight="semibold" className="text-lg tracking-tight">Tambah Mitra Reseller Baru</CardTitle>
            <CardDescription className="text-sm">Masukkan detail informasi reseller beserta batas/limit kredit plafon transaksi.</CardDescription>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-md text-muted-foreground hover:bg-muted active:scale-90 transition-all -mr-2 -mt-0.5"
            onClick={() => setIsAddDialogOpen(false)}
          >
            <LuX className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="px-6 py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="resellerName" className="text-sm font-semibold">Nama Reseller / Biro</Label>
            <TextField 
              id="resellerName" 
              placeholder="Contoh: Joni Biro, Sinar Printing, dll" 
              className="border-border/50 focus:bg-background transition-all" 
              value={newResellerName}
              onChange={(e) => setNewResellerName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="resellerEmail" className="text-sm font-semibold">Email Mitra</Label>
              <TextField 
                id="resellerEmail" 
                type="email"
                placeholder="Contoh: biro.joni@gmail.com" 
                className="border-border/50 focus:bg-background transition-all" 
                value={newResellerEmail}
                onChange={(e) => setNewResellerEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="resellerPhone" className="text-sm font-semibold">Nomor Telepon / WA</Label>
              <TextField 
                id="resellerPhone" 
                placeholder="Contoh: 081234567890" 
                className="border-border/50 focus:bg-background transition-all" 
                value={newResellerPhone}
                onChange={(e) => setNewResellerPhone(e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="resellerCreditLimit" className="text-sm font-semibold">Limit Kredit (Rupiah Plafon)</Label>
            <TextField 
              id="resellerCreditLimit" 
              type="number"
              placeholder="Contoh: 5000000" 
              className="border-border/50 focus:bg-background transition-all" 
              value={newResellerCreditLimit || ""}
              onChange={(e) => setNewResellerCreditLimit(Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="resellerAddress" className="text-sm font-semibold">Alamat Kantor/Toko</Label>
            <textarea 
              id="resellerAddress"
              className="w-full min-h-[80px] rounded-md border border-border/50 bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 resize-none"
              placeholder="Tuliskan alamat lengkap mitra biro/reseller..."
              value={newResellerAddress}
              onChange={(e) => setNewResellerAddress(e.target.value)}
            />
          </div>
        </CardContent>
        
        <CardFooter className="px-6 py-4 border-t border-border/50 flex justify-end gap-2">
          <Button 
            variant="outline" 
            className="h-10 px-4 rounded-md font-medium border-border/50 hover:bg-muted/50 active:scale-95 transition-all"
            onClick={() => setIsAddDialogOpen(false)}
          >
            Batal
          </Button>
          <Button 
            className="h-10 px-4 rounded-md font-medium bg-primary hover:bg-primary/90 active:scale-95 transition-all"
            onClick={handleSaveReseller}
          >
            Simpan Mitra
          </Button>
        </CardFooter>
      </Dialog>
    </div>
  );
};

export default ResellerPage;

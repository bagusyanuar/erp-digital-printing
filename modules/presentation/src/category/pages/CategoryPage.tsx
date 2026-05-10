import { Button } from "@erp-digital-printing/ui/Button";
import { TextField } from "@erp-digital-printing/ui/TextField";
import { Typography } from "@erp-digital-printing/ui/Typography";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@erp-digital-printing/ui/Card";
import { Dialog } from "@erp-digital-printing/ui/Dialog";
import { toast } from "@erp-digital-printing/ui/Toast";
import { 
  LuPlus, LuSearch, LuFilter, LuTags, LuX
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
import { useCategoryTable } from "../hooks/useCategoryTable";

const CategoryPage = () => {
  const { 
    table, 
    data, 
    isAddDialogOpen, 
    setIsAddDialogOpen 
  } = useCategoryTable();

  return (
    <div className="p-6 space-y-8 font-sans bg-background min-h-screen animate-in fade-in duration-700">
      {/* Header Section (Outside Card) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
            <LuTags className="text-primary" size={32} />
            Master Kategori
          </h1>
          <p className="text-muted-foreground font-medium">
            Kelola kategori produk dan jasa percetakan Anda.
          </p>
        </div>
      </div>

      {/* Main Table Section */}
      <Card className="rounded-3xl overflow-hidden shadow-sm border-border/50">
        {/* Table Header / Toolbar */}
        <CardHeader className="flex flex-row items-center justify-between gap-4 border-b border-border/30 p-6 bg-card">
          {/* Left Side: Search */}
          <div className="flex-1 max-w-md">
            <TextField 
              placeholder="Cari kategori..." 
              prefixIcon={LuSearch}
              className="w-full"
            />
          </div>

          {/* Right Side: Actions */}
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
              Tambah Kategori
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
                    <TableHead key={header.id} className={header.column.id === "actions" || header.column.id === "totalProducts" ? "text-center" : ""}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map(row => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>

        {/* Table Footer / Pagination */}
        <TablePagination
          currentPage={table.getState().pagination.pageIndex + 1}
          totalPages={table.getPageCount()}
          pageSize={table.getState().pagination.pageSize}
          totalEntries={data.length}
          onPageChange={(page) => table.setPageIndex(page - 1)}
          onPageSizeChange={(size) => table.setPageSize(size)}
        />
      </Card>

      {/* Add Category Dialog */}
      <Dialog isOpen={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)} size="md" showCloseButton={false}>
        <CardHeader className="px-6 py-4 border-b border-border/50 flex flex-row items-start justify-between gap-4">
          <div className="space-y-0.5">
            <CardTitle variant="h4" weight="semibold" className="text-lg tracking-tight">Tambah Kategori Baru</CardTitle>
            <CardDescription className="text-sm">Masukkan detail kategori produk digital printing baru.</CardDescription>
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
            <Typography variant="small" weight="medium" className="text-sm">Nama Kategori</Typography>
            <TextField placeholder="Contoh: Large Format, Merchandise, dll" className="border-border/50 focus:bg-background transition-all" />
          </div>
          
          <div className="space-y-2">
            <Typography variant="small" weight="medium" className="text-sm">Deskripsi (Opsional)</Typography>
            <textarea 
              className="w-full min-h-[100px] rounded-md border border-border/50 bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 resize-none"
              placeholder="Berikan deskripsi singkat tentang kategori ini..."
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
            onClick={() => {
              setIsAddDialogOpen(false);
              toast.success("Kategori Berhasil Ditambahkan", "Kategori produk baru telah berhasil disimpan ke sistem.");
            }}
          >
            Simpan Kategori
          </Button>
        </CardFooter>
      </Dialog>
    </div>
  );
};

export default CategoryPage;
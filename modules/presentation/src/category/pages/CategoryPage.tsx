import React, { useState } from 'react';
import { Button } from "@erp-digital-printing/ui/Button";
import { TextField } from "@erp-digital-printing/ui/TextField";
import { Typography } from "@erp-digital-printing/ui/Typography";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@erp-digital-printing/ui/Card";
import { Dialog } from "@erp-digital-printing/ui/Dialog";
import { 
  LuPlus, LuSearch, LuFilter, LuEllipsisVertical, LuTags, LuX
} from "@erp-digital-printing/ui/icons";

const CategoryPage = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Dummy Data yang relevan dengan Digital Printing
  const categories = [
    { id: 1, name: "Large Format", code: "CAT-LF", totalProducts: 45, status: "Active" },
    { id: 2, name: "Sticker & Label", code: "CAT-SL", totalProducts: 128, status: "Active" },
    { id: 3, name: "Indoor/Outdoor", code: "CAT-IO", totalProducts: 32, status: "Active" },
    { id: 4, name: "Merchandise", code: "CAT-MC", totalProducts: 12, status: "Inactive" },
    { id: 5, name: "Finishing Service", code: "CAT-FS", totalProducts: 8, status: "Active" },
  ];

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-700">
      {/* Main Table Section */}
      <Card className="overflow-hidden">
        {/* Table Header / Toolbar */}
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border bg-muted/5">
          <div className="flex flex-col gap-0.5">
            <CardTitle variant="h4">Master Kategori</CardTitle>
            <CardDescription>Kelola kategori produk dan jasa percetakan Anda.</CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <TextField 
              placeholder="Cari kategori..." 
              prefixIcon={LuSearch}
              className="w-full md:w-64"
            />
            <Button variant="outline" prefixIcon={LuFilter} size="sm">Filter</Button>
            <Button variant="default" prefixIcon={LuPlus} size="sm" onClick={() => setIsAddDialogOpen(true)}>Tambah Kategori</Button>
          </div>
        </CardHeader>

        {/* Table Body */}
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted/30 text-left border-b border-border">
                <th className="px-6 py-4">
                  <Typography variant="small" weight="black" className="text-muted-foreground uppercase tracking-widest text-[10px]">Info Kategori</Typography>
                </th>
                <th className="px-6 py-4">
                  <Typography variant="small" weight="black" className="text-muted-foreground uppercase tracking-widest text-[10px]">ID / Kode</Typography>
                </th>
                <th className="px-6 py-4 text-center">
                  <Typography variant="small" weight="black" className="text-muted-foreground uppercase tracking-widest text-[10px]">Total Produk</Typography>
                </th>
                <th className="px-6 py-4">
                  <Typography variant="small" weight="black" className="text-muted-foreground uppercase tracking-widest text-[10px]">Status</Typography>
                </th>
                <th className="px-6 py-4 text-right">
                  <Typography variant="small" weight="black" className="text-muted-foreground uppercase tracking-widest text-[10px]">Aksi</Typography>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {categories.map((cat) => (
                <tr key={cat.id} className="group hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-sm">
                        {cat.name.charAt(0)}
                      </div>
                      <Typography weight="bold" className="group-hover:text-primary transition-colors">{cat.name}</Typography>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <code className="bg-muted px-2 py-1 rounded text-[11px] font-bold text-muted-foreground border border-border/50">
                      {cat.code}
                    </code>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-sidebar-accent text-[10px] font-black text-muted-foreground uppercase">
                      {cat.totalProducts} Item
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      cat.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                    }`}>
                      <div className={`h-1.5 w-1.5 rounded-full ${cat.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      {cat.status}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-sidebar-accent">
                      <LuEllipsisVertical className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>

        {/* Table Footer */}
        <CardFooter className="flex items-center justify-between bg-muted/5 border-t border-border mt-0 p-4">
          <Typography variant="small" weight="bold" className="text-muted-foreground uppercase tracking-wider">Menampilkan 5 dari 24 kategori</Typography>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-8 px-4" disabled>Previous</Button>
            <Button variant="outline" size="sm" className="h-8 px-4">Next</Button>
          </div>
        </CardFooter>
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
            onClick={() => setIsAddDialogOpen(false)}
          >
            Simpan Kategori
          </Button>
        </CardFooter>
      </Dialog>
    </div>
  );
};

export default CategoryPage;
import React from 'react';
import { Button } from "@erp-digital-printing/ui/Button";
import { TextField } from "@erp-digital-printing/ui/TextField";
import { 
  LuPlus, LuSearch, LuFilter, LuEllipsisVertical, LuTags 
} from "@erp-digital-printing/ui/icons";

const CategoryPage = () => {
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
      <div className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
        {/* Table Header / Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 border-b border-border bg-muted/5">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-black text-foreground tracking-tight">Master Kategori</h2>
            <p className="text-xs font-medium text-muted-foreground">Kelola kategori produk dan jasa percetakan Anda.</p>
          </div>
          <div className="flex items-center gap-3">
            <TextField 
              placeholder="Cari kategori..." 
              prefixIcon={LuSearch}
              className="w-full md:w-64"
            />
            <Button variant="outline" prefixIcon={LuFilter} size="sm">Filter</Button>
            <Button variant="default" prefixIcon={LuPlus} size="sm">Tambah Kategori</Button>
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted/30 text-left border-b border-border">
                <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Info Kategori</th>
                <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">ID / Kode</th>
                <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center">Total Produk</th>
                <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-right">Aksi</th>
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
                      <span className="font-bold text-foreground group-hover:text-primary transition-colors">{cat.name}</span>
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
        </div>

        {/* Table Footer */}
        <div className="p-4 border-t border-border flex items-center justify-between text-[11px] font-bold text-muted-foreground bg-muted/5">
          <span className="uppercase tracking-wider">Menampilkan 5 dari 24 kategori</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-8 px-4" disabled>Previous</Button>
            <Button variant="outline" size="sm" className="h-8 px-4">Next</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
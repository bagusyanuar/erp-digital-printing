import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@erp-digital-printing/ui/Card';
import { Button } from '@erp-digital-printing/ui/Button';
import { TextField } from '@erp-digital-printing/ui/TextField';
import { Label } from '@erp-digital-printing/ui/Label';
import { Typography } from '@erp-digital-printing/ui/Typography';
import { Checkbox } from '@erp-digital-printing/ui/Checkbox';

const FormVariant = () => {
  return (
    <div className="container mx-auto p-6 max-w-5xl space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Typography variant="h2" weight="bold">Tambah Master Bahan</Typography>
          <Typography variant="small" className="text-muted-foreground">
            Definisikan bahan mentah atau kertas dasar yang tersedia di gudang.
          </Typography>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">Batal</Button>
          <Button className="bg-primary text-primary-foreground">Simpan Bahan</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri: Detail Varian */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle variant="h4">Informasi Bahan / Material</CardTitle>
              <CardDescription>Nama ini akan muncul sebagai pilihan saat membuat produk.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="variantName">Nama Bahan (Contoh: HVS 80g)</Label>
                  <TextField id="variantName" placeholder="Contoh: HVS 80gsm, Art Paper 120, Flexi 280g" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="variantCode">Kode Material (Optional)</Label>
                  <TextField id="variantCode" placeholder="MAT-HVS-80" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brand">Merk / Supplier (Optional)</Label>
                  <TextField id="brand" placeholder="Contoh: Paperline, Ritrama, dll" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Catatan / Deskripsi</Label>
                  <textarea 
                    id="description"
                    className="w-full border rounded-md p-2 text-sm min-h-[100px] bg-background focus:ring-1 focus:ring-primary outline-none"
                    placeholder="Keterangan tambahan mengenai spesifikasi bahan..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Kolom Kanan: Assignment & Settings */}
        <div className="space-y-6">
          {/* Section: Category Assignment */}
          <Card>
            <CardHeader>
              <CardTitle variant="h4">Kategori Penggunaan</CardTitle>
              <CardDescription>Centang kategori mana saja yang bisa menggunakan bahan ini.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3 p-2 hover:bg-muted/50 rounded-md transition-colors cursor-pointer">
                <Checkbox id="cat-a3" />
                <Label htmlFor="cat-a3" className="flex-1 cursor-pointer">A3+</Label>
              </div>
              <div className="flex items-center space-x-3 p-2 hover:bg-muted/50 rounded-md transition-colors cursor-pointer">
                <Checkbox id="cat-banner" />
                <Label htmlFor="cat-banner" className="flex-1 cursor-pointer">Banner (MMT & Kain)</Label>
              </div>
              <div className="flex items-center space-x-3 p-2 hover:bg-muted/50 rounded-md transition-colors cursor-pointer">
                <Checkbox id="cat-indoor" />
                <Label htmlFor="cat-indoor" className="flex-1 cursor-pointer">Indoor Media</Label>
              </div>
              <Typography variant="small" className="text-muted-foreground italic text-[11px] mt-2">
                * Varian hanya akan muncul di form Produk yang kategorinya dicentang di atas.
              </Typography>
            </CardContent>
          </Card>

          {/* Section: Status */}
          <Card>
            <CardHeader>
              <CardTitle variant="h4">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Label htmlFor="activeStatus">Status Aktif</Label>
                <Checkbox id="activeStatus" defaultChecked />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FormVariant;

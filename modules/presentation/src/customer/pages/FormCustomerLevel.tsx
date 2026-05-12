import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@erp-digital-printing/ui/Card';
import { Button } from '@erp-digital-printing/ui/Button';
import { TextField } from '@erp-digital-printing/ui/TextField';
import { Label } from '@erp-digital-printing/ui/Label';
import { Typography } from '@erp-digital-printing/ui/Typography';
import { Checkbox } from '@erp-digital-printing/ui/Checkbox';

const FormCustomerLevel = () => {
  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Typography variant="h2" weight="bold">Tambah Level Pelanggan</Typography>
          <Typography variant="small" className="text-muted-foreground">
            Definisikan segmentasi pelanggan untuk keperluan matriks harga bertingkat.
          </Typography>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">Batal</Button>
          <Button className="bg-primary text-primary-foreground">Simpan Level</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle variant="h4">Informasi Level Pelanggan</CardTitle>
              <CardDescription>Nama ini akan muncul sebagai Tab di form Matriks Harga Produk.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="levelName">Nama Level</Label>
                <TextField id="levelName" placeholder="Contoh: Regular, Reseller, Agen, Corporate" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="levelDesc">Deskripsi</Label>
                <textarea 
                  id="levelDesc"
                  className="w-full border rounded-md p-2 text-sm min-h-[100px] bg-background focus:ring-1 focus:ring-primary outline-none"
                  placeholder="Keterangan singkat mengenai syarat masuk ke level ini..."
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle variant="h4">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Label htmlFor="isDefault">Jadikan Default?</Label>
                <Checkbox id="isDefault" />
              </div>
              <Typography variant="small" className="text-muted-foreground italic text-[11px] mt-2 block">
                * Level default akan otomatis terpilih untuk customer baru yang belum diverifikasi.
              </Typography>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FormCustomerLevel;

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@erp-digital-printing/ui/Card';
import { Button } from '@erp-digital-printing/ui/Button';
import { TextField } from '@erp-digital-printing/ui/TextField';
import { Label } from '@erp-digital-printing/ui/Label';
import { Typography } from '@erp-digital-printing/ui/Typography';
import { Checkbox } from '@erp-digital-printing/ui/Checkbox';

const FormAttribute = () => {
  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Typography variant="h2" weight="bold">Tambah Master Atribut (EAV)</Typography>
          <Typography variant="small" className="text-muted-foreground">
            Definisikan spesifikasi dinamis yang bisa digunakan di berbagai bahan/produk.
          </Typography>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">Batal</Button>
          <Button className="bg-primary text-primary-foreground">Simpan Atribut</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle variant="h4">Informasi Atribut</CardTitle>
              <CardDescription>Detail spesifikasi yang akan muncul saat membuat produk.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="attrName">Nama Atribut</Label>
                  <TextField id="attrName" placeholder="Contoh: Gramasi, Warna Dasar, Ukuran Custom" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="attrUnit">Satuan / Unit (Optional)</Label>
                  <TextField id="attrUnit" placeholder="Contoh: gsm, cm, pt" />
                </div>
                <div className="space-y-2 md:col-span-2 mt-2">
                  <Label>Tipe Input</Label>
                  <select className="w-full border rounded-md p-2 text-sm bg-background h-10">
                    <option>Teks Bebas (Text)</option>
                    <option>Angka (Number)</option>
                    <option>Pilihan Ganda (Dropdown)</option>
                  </select>
                </div>
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

export default FormAttribute;

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@erp-digital-printing/ui/Card';
import { Button } from '@erp-digital-printing/ui/Button';
import { TextField } from '@erp-digital-printing/ui/TextField';
import { Label } from '@erp-digital-printing/ui/Label';
import { Typography } from '@erp-digital-printing/ui/Typography';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from '@erp-digital-printing/ui/Table';
import { Checkbox } from '@erp-digital-printing/ui/Checkbox';

const FormProduct = () => {
  const [selectedCategory, setSelectedCategory] = useState("A3+");
  const [activeTab, setActiveTab] = useState<'regular' | 'reseller'>('regular');
  
  // Mock Data untuk Tier Harga
  const [tiers, setTiers] = useState([
    { id: 't1', label: '1-4', minQty: 1 },
    { id: 't2', label: '5-99', minQty: 5 },
    { id: 't3', label: '100-249', minQty: 100 },
    { id: 't4', label: '250>', minQty: 250 }
  ]);
  
  // Di skema BE, ini adalah product_variants (Opsi Cetak)
  const [variants, setVariants] = useState([
    { id: 'v1', name: '1 Sisi', additionalCost: 0 },
    { id: 'v2', name: '2 Sisi', additionalCost: 2000 }
  ]);

  // Mock Data EAV Attributes
  const [attributes, setAttributes] = useState([
    { id: 'a1', name: 'Gramasi', value: '150g' },
    { id: 'a2', name: 'Warna Dasar', value: 'Putih' }
  ]);

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      {/* Header Form */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Typography variant="h2" weight="bold">Tambah Bahan / Produk</Typography>
          <Typography variant="small" className="text-muted-foreground">
            Definisikan bahan mentah, spesifikasi atribut (EAV), opsi cetak (Varian), dan matriks harganya.
          </Typography>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">Batal</Button>
          <Button className="bg-primary text-primary-foreground">Simpan Data</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Utama */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section 1: Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle variant="h4">Informasi Dasar (Bahan)</CardTitle>
              <CardDescription>Identitas utama material yang akan digunakan dalam transaksi.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="prodName">Nama Bahan / Material</Label>
                  <TextField id="prodName" placeholder="Contoh: Art Paper 150g, Sticker Vinyl, Flexi 280g" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Kategori</Label>
                  <select 
                    id="category" 
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full border rounded-md p-2 text-sm bg-background h-10 border-primary bg-primary/5 font-semibold text-primary"
                  >
                    <option value="A3+">A3+</option>
                    <option value="Banner (MMT & Kain)">Banner (MMT & Kain)</option>
                    <option value="Indoor Media">Indoor Media</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="uom">Satuan Transaksi / Jual (UoM)</Label>
                  <select 
                    id="uom" 
                    className="w-full border rounded-md p-2 text-sm bg-background h-10"
                    defaultValue="Lembar (Sheet)"
                  >
                    <option value="Lembar (Sheet)">Lembar (Sheet)</option>
                    <option value="Meter Persegi (m2)">Meter Persegi (m2)</option>
                    <option value="Meter Lari (m)">Meter Lari (m)</option>
                    <option value="Pcs / Satuan">Pcs / Satuan</option>
                    <option value="Box">Box</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: EAV Attributes */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle variant="h4">Spesifikasi Tambahan (Atribut)</CardTitle>
                <CardDescription>Tambahkan spesifikasi dinamis tanpa merubah struktur database.</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="h-8 text-xs">+ Tambah Spesifikasi</Button>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md divide-y">
                {attributes.map(attr => (
                  <div key={attr.id} className="flex items-center gap-4 p-3 bg-muted/20">
                    <div className="flex-1 space-y-1">
                      <Label className="text-xs text-muted-foreground">Nama Atribut</Label>
                      <TextField value={attr.name} className="h-8 text-sm" readOnly />
                    </div>
                    <div className="flex-1 space-y-1">
                      <Label className="text-xs text-muted-foreground">Nilai (Value)</Label>
                      <TextField value={attr.value} className="h-8 text-sm" />
                    </div>
                    <button className="mt-5 text-muted-foreground hover:text-destructive p-2">&times;</button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Pricing Configuration */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle variant="h4">Opsi Varian & Matriks Harga</CardTitle>
                <CardDescription>Setup matriks harga bertingkat berdasarkan varian (Opsi Cetak).</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              
              {/* Tiers & Variants Setup */}
              <div className="grid grid-cols-2 gap-6 p-4 bg-muted/30 rounded-lg border">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="font-semibold">Tier Kuantitas</Label>
                    <Button variant="ghost" size="sm" className="h-6 text-xs text-primary">+ Tambah Tier</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tiers.map(t => (
                      <div key={t.id} className="bg-background border rounded-md px-3 py-1 text-xs font-medium flex items-center gap-2">
                        {t.label} 
                        <button className="text-muted-foreground hover:text-destructive">&times;</button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="font-semibold">Daftar Opsi / Varian</Label>
                    <Button variant="ghost" size="sm" className="h-6 text-xs text-primary">+ Tambah Opsi</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {variants.map(v => (
                      <div key={v.id} className="bg-background border rounded-md px-3 py-1 text-xs font-medium flex items-center gap-2">
                        {v.name}
                        <button className="text-muted-foreground hover:text-destructive">&times;</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Pricing Matrix Table */}
              <div className="space-y-3">
                <div className="flex justify-between items-end border-b pb-2">
                  <Typography variant="small" weight="bold">Matriks Harga Berdasarkan Opsi</Typography>
                  
                  {/* Tabs Regular / Reseller */}
                  <div className="flex bg-muted p-1 rounded-md">
                    <button 
                      onClick={() => setActiveTab('regular')}
                      className={`px-4 py-1.5 text-xs font-medium rounded-sm transition-colors ${activeTab === 'regular' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      Harga Regular
                    </button>
                    <button 
                      onClick={() => setActiveTab('reseller')}
                      className={`px-4 py-1.5 text-xs font-medium rounded-sm transition-colors ${activeTab === 'reseller' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      Harga Reseller/Biro
                    </button>
                  </div>
                </div>

                <div className="border rounded-md overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="w-[150px] font-bold">Opsi (Varian)</TableHead>
                        {tiers.map(t => (
                          <TableHead key={t.id} className="text-center font-bold">Qty {t.label}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {variants.map((v, i) => (
                        <TableRow key={v.id} className={i % 2 === 0 ? '' : 'bg-muted/10'}>
                          <TableCell className="font-medium align-middle">
                            {v.name}
                            {v.additionalCost > 0 && (
                              <div className="text-[10px] text-muted-foreground mt-1">
                                + Rp {v.additionalCost.toLocaleString()}
                              </div>
                            )}
                          </TableCell>
                          {tiers.map(t => (
                            <TableCell key={`${v.id}-${t.id}`} className="p-2">
                              <div className="relative">
                                <span className="absolute left-2 top-2.5 text-xs text-muted-foreground">Rp</span>
                                <input type="text" className="w-full border rounded text-right p-1.5 text-sm pl-6 bg-background focus:ring-1 focus:ring-primary outline-none" placeholder="0" />
                              </div>
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
              
            </CardContent>
          </Card>
        </div>

        {/* Kolom Samping: Konfigurasi Tambahan */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle variant="h4">Pengaturan Sistem</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="active">Status Aktif</Label>
                <Checkbox id="active" defaultChecked />
              </div>
              <div className="space-y-2 border-t pt-4">
                <Typography variant="small" weight="bold">Catatan Internal</Typography>
                <textarea 
                  className="w-full border rounded-md p-2 text-sm min-h-[100px] bg-background"
                  placeholder="Informasi khusus untuk admin..."
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FormProduct;

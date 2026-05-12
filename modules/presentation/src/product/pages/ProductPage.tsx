import React, { useState } from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from '@erp-digital-printing/ui/Card';
import { Button } from '@erp-digital-printing/ui/Button';
import { TextField } from '@erp-digital-printing/ui/TextField';
import { Label } from '@erp-digital-printing/ui/Label';
import { Typography } from '@erp-digital-printing/ui/Typography';

type Category = 'A3+' | 'Banner' | 'Indoor Media';
type CustomerType = 'Regular' | 'Reseller/Biro';

const ProductPage = () => {
  // State sederhana untuk simulasi toggling layout
  const [selectedCategory, setSelectedCategory] = useState<Category>('A3+');
  const [customerType, setCustomerType] = useState<CustomerType>('Regular');

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <Typography variant="h2" weight="bold" className="mb-6">
        Digital Print Order
      </Typography>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Product Selection */}
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle variant="h4">Product Category</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant={selectedCategory === 'A3+' ? "default" : "outline"}
                  onClick={() => setSelectedCategory('A3+')}
                  className={selectedCategory === 'A3+' ? "w-full justify-start text-left bg-primary text-primary-foreground" : "w-full justify-start text-left bg-transparent"}
                >
                  A3+
                </Button>
                <Button 
                  variant={selectedCategory === 'Banner' ? "default" : "outline"}
                  onClick={() => setSelectedCategory('Banner')}
                  className={selectedCategory === 'Banner' ? "w-full justify-start text-left bg-primary text-primary-foreground" : "w-full justify-start text-left bg-transparent"}
                >
                  Banner (MMT & Kain)
                </Button>
                <Button 
                  variant={selectedCategory === 'Indoor Media' ? "default" : "outline"}
                  onClick={() => setSelectedCategory('Indoor Media')}
                  className={selectedCategory === 'Indoor Media' ? "w-full justify-start text-left bg-primary text-primary-foreground" : "w-full justify-start text-left bg-transparent"}
                >
                  Indoor Media
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle variant="h4">Material</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="grid grid-cols-2 gap-2">
                 
                 {/* Material untuk A3+ */}
                 {selectedCategory === 'A3+' && (
                   <>
                    <div className="border rounded-md p-3 cursor-pointer border-primary bg-primary/5">
                      <Typography variant="small" weight="bold">HVS</Typography>
                      <Typography variant="small" className="text-muted-foreground">80gsm</Typography>
                    </div>
                    <div className="border rounded-md p-3 cursor-pointer hover:bg-muted/50 transition-colors">
                      <Typography variant="small" weight="bold">Art Paper</Typography>
                      <Typography variant="small" className="text-muted-foreground">120gsm</Typography>
                    </div>
                    <div className="border rounded-md p-3 cursor-pointer hover:bg-muted/50 transition-colors">
                      <Typography variant="small" weight="bold">Art Carton</Typography>
                      <Typography variant="small" className="text-muted-foreground">260gsm</Typography>
                    </div>
                   </>
                 )}

                 {/* Material untuk Banner */}
                 {selectedCategory === 'Banner' && (
                   <>
                    <div className="border rounded-md p-3 cursor-pointer border-primary bg-primary/5">
                      <Typography variant="small" weight="bold">Flexi</Typography>
                      <Typography variant="small" className="text-muted-foreground">280g</Typography>
                    </div>
                    <div className="border rounded-md p-3 cursor-pointer hover:bg-muted/50 transition-colors">
                      <Typography variant="small" weight="bold">Korchin</Typography>
                      <Typography variant="small" className="text-muted-foreground">High Res</Typography>
                    </div>
                   </>
                 )}

                 {/* Varian untuk Indoor Media */}
                 {selectedCategory === 'Indoor Media' && (
                   <>
                    <div className="border rounded-md p-3 cursor-pointer border-primary bg-primary/5">
                      <Typography variant="small" weight="bold">Stiker Vinyl</Typography>
                      <Typography variant="small" className="text-muted-foreground">Ritrama / Graftac</Typography>
                    </div>
                    <div className="border rounded-md p-3 cursor-pointer hover:bg-muted/50 transition-colors">
                      <Typography variant="small" weight="bold">Albatros</Typography>
                      <Typography variant="small" className="text-muted-foreground">Photo Paper</Typography>
                    </div>
                   </>
                 )}

               </div>
            </CardContent>
          </Card>
        </div>

        {/* Middle Column: Dynamic Inputs */}
        <div className="lg:col-span-5 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle variant="h3">Order Details ({selectedCategory})</CardTitle>
              <CardDescription>Enter quantity and properties based on selected product.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Dynamic Dimensions: TAMPIL JIKA BANNER ATAU INDOOR (UoM: m2) */}
              {(selectedCategory === 'Banner' || selectedCategory === 'Indoor Media') && (
                <div className="space-y-3">
                  <Typography variant="h4">Dimensions (cm)</Typography>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="width">Width (Panjang)</Label>
                      <TextField id="width" type="number" placeholder="e.g. 100" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="height">Height (Lebar)</Label>
                      <TextField id="height" type="number" placeholder="e.g. 50" />
                    </div>
                  </div>
                </div>
              )}

              {/* Print Sides: TAMPIL HANYA JIKA A3+ */}
              {selectedCategory === 'A3+' && (
                <div className="space-y-3">
                  <Typography variant="h4">Print Type</Typography>
                  <div className="flex gap-2">
                     <Button variant="outline" className="flex-1 bg-primary/10 border-primary">1 Sisi</Button>
                     <Button variant="outline" className="flex-1">2 Sisi</Button>
                  </div>
                </div>
              )}

              {/* Quantity: SELALU TAMPIL, TAPI SATUANNYA BEDA */}
               <div className="space-y-3">
                <Typography variant="h4">
                  Quantity 
                  {(selectedCategory === 'Banner' || selectedCategory === 'Indoor Media') ? ' (Pcs / Lembar)' : 
                   selectedCategory === 'A3+' ? ' (Lembar A3+)' : ' (Pcs)'}
                </Typography>
                <div>
                   <TextField id="qty" type="number" placeholder="100" defaultValue="1" />
                </div>
              </div>

              {/* Job Details */}
              <div className="space-y-3 pt-4 border-t">
                <Typography variant="h4">Job Information</Typography>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <Label htmlFor="jobName">Job Name / File Name</Label>
                    <TextField id="jobName" placeholder={`e.g. Cetak ${selectedCategory} Promo`} />
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* Right Column: Price Summary */}
        <div className="lg:col-span-4 relative">
          <div className="sticky top-6 space-y-6">

            {/* Customer Type Selector */}
            <Card className="border-primary/20 shadow-sm">
              <CardContent className="p-4 flex items-center justify-between">
                <Typography variant="small" weight="bold">Customer Type</Typography>
                <div className="flex gap-1 bg-muted p-1 rounded-md">
                  <Button 
                    variant={customerType === 'Regular' ? 'default' : 'ghost'} 
                    size="sm" 
                    className="h-7 text-xs"
                    onClick={() => setCustomerType('Regular')}
                  >
                    Regular
                  </Button>
                  <Button 
                    variant={customerType === 'Reseller/Biro' ? 'default' : 'ghost'} 
                    size="sm" 
                    className="h-7 text-xs"
                    onClick={() => setCustomerType('Reseller/Biro')}
                  >
                    Reseller/Biro
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20 shadow-md">
              <CardHeader className="bg-muted/30 pb-4">
                <CardTitle variant="h3">Price Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Product</span>
                    <span className="font-medium text-right">
                      {selectedCategory === 'Banner' ? 'Banner Flexi 280g' : 
                       selectedCategory === 'A3+' ? 'A3+ HVS 80gsm (1 Sisi)' : 'Stiker Vinyl Ritrama'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Base Price ({customerType})</span>
                    <span className="font-semibold text-primary">
                      {customerType === 'Reseller/Biro' 
                        ? (selectedCategory === 'Banner' ? 'Rp 18.000 / m²' : selectedCategory === 'A3+' ? 'Rp 2.500 / lbr' : 'Rp 65.000 / m²')
                        : (selectedCategory === 'Banner' ? 'Rp 25.000 / m²' : selectedCategory === 'A3+' ? 'Rp 3.500 / lbr' : 'Rp 85.000 / m²')}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Units</span>
                    <span>
                      {(selectedCategory === 'Banner' || selectedCategory === 'Indoor Media') ? '20 m² (P x L x Qty)' : '10 Lembar'}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-4 flex justify-between items-end">
                  <Typography variant="h4">Total Cost</Typography>
                  <Typography variant="h2" weight="bold" className="text-primary">
                    {customerType === 'Reseller/Biro' 
                      ? (selectedCategory === 'Banner' ? 'Rp 360.000' : selectedCategory === 'A3+' ? 'Rp 25.000' : 'Rp 1.300.000')
                      : (selectedCategory === 'Banner' ? 'Rp 400.000' : selectedCategory === 'A3+' ? 'Rp 30.000' : 'Rp 1.700.000')}
                  </Typography>
                </div>

              </CardContent>
              <CardFooter>
                <Button className="w-full text-lg h-12">
                  Add to Order
                </Button>
              </CardFooter>
            </Card>
            
            {/* Active Tier Info Card */}
            <Card className={customerType === 'Reseller/Biro' ? "bg-blue-500/10 border-blue-500/20" : "bg-green-500/10 border-green-500/20"}>
              <CardContent className="p-4 flex items-start gap-3">
                <div className={`mt-0.5 h-6 w-6 rounded-full flex items-center justify-center shrink-0 ${customerType === 'Reseller/Biro' ? 'bg-blue-500/20 text-blue-600' : 'bg-green-500/20 text-green-600'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"></path></svg>
                </div>
                <div>
                  <Typography variant="small" weight="bold" className={customerType === 'Reseller/Biro' ? "text-blue-700 dark:text-blue-400" : "text-green-700 dark:text-green-400"}>
                    {customerType === 'Reseller/Biro' ? 'Active: Biro Pricing' : 'Active Tier: Wholesale'}
                  </Typography>
                  <Typography variant="small" className={customerType === 'Reseller/Biro' ? "text-blue-600/80 dark:text-blue-400/80" : "text-green-600/80 dark:text-green-400/80"}>
                    {customerType === 'Reseller/Biro' ? 'Special wholesale margin applied.' : 'You\'re getting the best price!'}
                  </Typography>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
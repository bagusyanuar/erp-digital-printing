import React, { useState, useEffect } from "react";
import { Dialog } from "@erp-digital-printing/ui/Dialog";
import { Button } from "@erp-digital-printing/ui/Button";
import { TextField } from "@erp-digital-printing/ui/TextField";
import { Label } from "@erp-digital-printing/ui/Label";
import { DatePicker } from "@erp-digital-printing/ui/DatePicker";
import {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@erp-digital-printing/ui/Card";
import {
  Combobox,
  ComboboxTrigger,
  ComboboxContent,
  ComboboxInput,
  ComboboxEmpty,
  ComboboxList,
  ComboboxItem,
} from "@erp-digital-printing/ui/Combobox";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@erp-digital-printing/ui/Table";
import {
  LuX,
  LuPlus,
  LuTrash2,
  LuFileText,
  LuUser,
  LuUserCheck,
  LuPencil,
  LuBox,
  LuReceipt,
} from "@erp-digital-printing/ui/icons";
import { ExpenseBill, ExpenseBillItem } from "../types/expenseTypes";

interface ExpenseFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  bill: ExpenseBill | null;
  readOnly?: boolean;
  onSave?: (bill: ExpenseBill) => void;
}

// Category lists with automatic cost type classification
const CATEGORIES = [
  { id: "cat-1", name: "ART PAPER", type: "PRODUCTION" as const },
  { id: "cat-2", name: "TINTA OUTDOOR", type: "PRODUCTION" as const },
  { id: "cat-3", name: "TONER / SPAREPART", type: "PRODUCTION" as const },
  { id: "cat-4", name: "STIKER", type: "PRODUCTION" as const },
  { id: "cat-5", name: "Gaji Karyawan", type: "OPERATIONAL" as const },
  { id: "cat-6", name: "Biaya Listrik (PLN)", type: "OPERATIONAL" as const },
  { id: "cat-7", name: "Biaya Internet (Indihome)", type: "OPERATIONAL" as const },
  { id: "cat-8", name: "Air Minum Galon", type: "OPERATIONAL" as const },
];

const SUPPLIERS = [
  { id: "sup-1", name: "PT Surya Paperindo" },
  { id: "sup-2", name: "Indo Printing Supply" },
  { id: "sup-3", name: "Jaya Sparepartindo" },
];

let idCounter = 0;
const generateUniqueId = (prefix: string): string => {
  idCounter += 1;
  return `${prefix}-${Date.now()}-${idCounter}`;
};

const toLocalDateString = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const ExpenseFormDialog: React.FC<ExpenseFormDialogProps> = ({
  isOpen,
  onClose,
  bill,
  readOnly = false,
  onSave,
}) => {
  // Main form states (Right panel metadata)
  const [date, setDate] = useState(() => (bill ? bill.date : toLocalDateString(new Date())) || "");
  const [billNumber, setBillNumber] = useState(() => (bill ? bill.billNumber : `BILL-${Math.floor(1000 + Math.random() * 9000)}`));
  const [isManualSupplier, setIsManualSupplier] = useState(() => {
    if (!bill) return false;
    const isRegistered = SUPPLIERS.some((s) => s.id === bill.supplierId);
    return !isRegistered;
  });
  const [supplierId, setSupplierId] = useState(() => bill?.supplierId || "");
  const [supplierName, setSupplierName] = useState(() => bill?.supplierName || "");
  const [description, setDescription] = useState(() => bill?.description || "");
  const [discount, setDiscount] = useState(() => (bill?.discount || 0).toString());

  // Added Items List
  const [items, setItems] = useState<ExpenseBillItem[]>(() => {
    if (bill) {
      return bill.items;
    }
    return [];
  });

  // States for the Left Panel (Active Item Spec Form)
  const [itemDescription, setItemDescription] = useState("");
  const [itemCategoryId, setItemCategoryId] = useState("");
  const [itemAmount, setItemAmount] = useState("");
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // Down Payment / Initial Payment states (only active when creating new)
  const [initialPayment, setInitialPayment] = useState("0");
  const [paymentAccount, setPaymentAccount] = useState("Cash");
  const [isSplitPayment, setIsSplitPayment] = useState(false);
  const [splitAmountCash, setSplitAmountCash] = useState("0");
  const [splitAmountTransfer, setSplitAmountTransfer] = useState("0");

  // Reset/sync Left Panel item form when entering edit mode or clearing
  const activeCategory = CATEGORIES.find((c) => c.id === itemCategoryId);

  // Handler: Insert/Update Item from Left Panel into Right Panel Items List
  const handleAddOrUpdateItem = () => {
    if (!itemCategoryId) {
      alert("Silakan pilih kategori biaya terlebih dahulu.");
      return;
    }
    if (!itemDescription.trim()) {
      alert("Silakan masukkan keterangan/deskripsi item.");
      return;
    }
    const amountVal = parseFloat(itemAmount) || 0;
    if (amountVal <= 0) {
      alert("Nominal biaya harus lebih besar dari Rp 0.");
      return;
    }

    const categoryObj = CATEGORIES.find((c) => c.id === itemCategoryId);
    if (!categoryObj) return;

    if (editingItemId) {
      // Edit existing item
      setItems((prev) =>
        prev.map((item) =>
          item.id === editingItemId
            ? {
                ...item,
                description: itemDescription.trim(),
                amount: amountVal,
                categoryId: itemCategoryId,
                categoryName: categoryObj.name,
                expenseType: categoryObj.type,
              }
            : item
        )
      );
      setEditingItemId(null);
    } else {
      // Add new item
      const newItem: ExpenseBillItem = {
        id: generateUniqueId("item"),
        description: itemDescription.trim(),
        amount: amountVal,
        categoryId: itemCategoryId,
        categoryName: categoryObj.name,
        expenseType: categoryObj.type,
      };
      setItems((prev) => [...prev, newItem]);
    }

    // Reset item form fields
    setItemDescription("");
    setItemCategoryId("");
    setItemAmount("");
  };

  const handleEditItem = (item: ExpenseBillItem) => {
    setEditingItemId(item.id);
    setItemDescription(item.description);
    setItemCategoryId(item.categoryId);
    setItemAmount(item.amount.toString());
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    if (editingItemId === id) {
      setEditingItemId(null);
      setItemDescription("");
      setItemCategoryId("");
      setItemAmount("");
    }
  };

  // Computations
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const discountAmount = parseFloat(discount) || 0;
  const totalAmount = Math.max(0, subtotal - discountAmount);

  const livePaidAmount = isSplitPayment
    ? (parseFloat(splitAmountCash) || 0) + (parseFloat(splitAmountTransfer) || 0)
    : (parseFloat(initialPayment) || 0);

  const liveRemaining = Math.max(0, totalAmount - livePaidAmount);
  const isLunas = liveRemaining <= 0;
  const liveChange = livePaidAmount > totalAmount ? livePaidAmount - totalAmount : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSave) return;

    if (items.length === 0) {
      alert("Daftar item belanja masih kosong. Silakan tambah item di panel kiri terlebih dahulu.");
      return;
    }

    const finalSupplierName = isManualSupplier
      ? supplierName
      : SUPPLIERS.find((s) => s.id === supplierId)?.name || supplierName || "Cash Pihak Ketiga";

    let finalPaidAmount = 0;
    let finalPayments: ExpenseBill["payments"] = [];

    if (bill) {
      finalPaidAmount = bill.paidAmount;
      finalPayments = bill.payments;
    } else {
      if (isSplitPayment) {
        const cashVal = parseFloat(splitAmountCash) || 0;
        const transferVal = parseFloat(splitAmountTransfer) || 0;
        const totalInput = cashVal + transferVal;
        finalPaidAmount = Math.min(totalInput, totalAmount);

        if (totalInput > totalAmount) {
          const cashPaid = Math.min(cashVal, totalAmount);
          const transferPaid = Math.max(0, totalAmount - cashPaid);

          if (cashPaid > 0) {
            finalPayments.push({
              id: generateUniqueId("pay"),
              expenseBillId: "",
              paymentDate: date,
              paymentAccount: "Cash",
              amountPaid: cashPaid,
            });
          }
          if (transferPaid > 0) {
            finalPayments.push({
              id: generateUniqueId("pay"),
              expenseBillId: "",
              paymentDate: date,
              paymentAccount: "Transfer",
              amountPaid: transferPaid,
            });
          }
        } else {
          if (cashVal > 0) {
            finalPayments.push({
              id: generateUniqueId("pay"),
              expenseBillId: "",
              paymentDate: date,
              paymentAccount: "Cash",
              amountPaid: cashVal,
            });
          }
          if (transferVal > 0) {
            finalPayments.push({
              id: generateUniqueId("pay"),
              expenseBillId: "",
              paymentDate: date,
              paymentAccount: "Transfer",
              amountPaid: transferVal,
            });
          }
        }
      } else {
        const initPayVal = parseFloat(initialPayment) || 0;
        finalPaidAmount = Math.min(initPayVal, totalAmount);
        if (finalPaidAmount > 0) {
          finalPayments.push({
            id: generateUniqueId("pay"),
            expenseBillId: "",
            paymentDate: date,
            paymentAccount,
            amountPaid: finalPaidAmount,
          });
        }
      }
    }

    const paymentStatus: ExpenseBill["paymentStatus"] =
      finalPaidAmount >= totalAmount
        ? "PAID"
        : finalPaidAmount > 0
        ? "PARTIAL_PAID"
        : "UNPAID";

    const newBill: ExpenseBill = {
      id: bill?.id || generateUniqueId("bill"),
      billNumber,
      date,
      supplierId: isManualSupplier ? undefined : supplierId,
      supplierName: finalSupplierName,
      discount: discountAmount,
      totalAmount,
      paidAmount: finalPaidAmount,
      paymentStatus: bill ? bill.paymentStatus : paymentStatus,
      description,
      items,
      payments: finalPayments,
    };

    onSave(newBill);
    onClose();
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val);
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} size="xl" showCloseButton={false}>
      <form onSubmit={handleSubmit}>
        {/* Header */}
        <CardHeader className="px-6 py-5 border-b border-border/50 flex flex-row items-start justify-between gap-4 bg-card">
          <div className="space-y-0.5">
            <CardTitle variant="h4" weight="semibold" className="text-lg tracking-tight">
              {readOnly
                ? "Detail Rincian Nota Pengeluaran"
                : bill
                ? "Ubah Nota Pengeluaran"
                : "Catat Nota Pengeluaran Baru"}
            </CardTitle>
            <CardDescription className="text-sm">
              {readOnly
                ? "Detail rincian belanjaan dan riwayat cicilan nota tagihan."
                : "Gunakan panel kiri untuk menyusun item belanja, dan panel kanan untuk informasi nota."}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-muted active:scale-90 transition-all -mr-2 -mt-0.5"
            type="button"
            onClick={onClose}
          >
            <LuX className="h-4 w-4" />
          </Button>
        </CardHeader>

        {/* Content Body */}
        <CardContent className="p-0 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch divide-y lg:divide-y-0 lg:divide-x divide-border/50">
            
            {/* LEFT PANEL: Dynamic Item Spec Builder (Col span: 5/12) */}
            <div className="lg:col-span-5 p-6 space-y-5 bg-muted/5">
              <div className="flex items-center gap-2 pb-2 border-b border-border/30">
                <div className="h-7 w-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <LuBox size={16} />
                </div>
                <h3 className="text-sm font-bold text-foreground">
                  {editingItemId ? "Ubah Item Belanja" : "Spesifikasi Item Belanja"}
                </h3>
              </div>

              {readOnly ? (
                <div className="p-4 bg-muted/20 border border-border/30 rounded-2xl text-xs text-muted-foreground text-center font-medium">
                  Form spesifikasi dinonaktifkan dalam mode detail (Read-only).
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Category Selection */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-foreground/85">Kategori Biaya *</Label>
                    <Combobox value={itemCategoryId} onValueChange={setItemCategoryId}>
                      <ComboboxTrigger className="font-semibold w-full h-10 border rounded-xl px-3 border-border/50 text-xs bg-background text-left flex items-center justify-between">
                        <span>{activeCategory?.name || "-- Pilih Kategori Biaya --"}</span>
                      </ComboboxTrigger>
                      <ComboboxContent className="w-[var(--radix-popover-trigger-width)] bg-background border border-border/85 shadow-lg rounded-xl overflow-hidden z-[10002]">
                        <ComboboxInput placeholder="Cari kategori..." />
                        <ComboboxEmpty>Kategori tidak ditemukan.</ComboboxEmpty>
                        <ComboboxList className="max-h-48 overflow-y-auto p-1">
                          {CATEGORIES.map((c) => (
                            <ComboboxItem key={c.id} value={c.id}>
                              {c.name}
                            </ComboboxItem>
                          ))}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                  </div>

                  {/* Auto-fill Cost Type Badge */}
                  {activeCategory && (
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-primary/5 border border-primary/10 text-xs animate-in slide-in-from-top-2 duration-300">
                      <span className="font-semibold text-muted-foreground">Tipe Klasifikasi:</span>
                      <span
                        className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded border ${
                          activeCategory.type === "PRODUCTION"
                            ? "bg-sky-500/10 text-sky-600 border-sky-500/20"
                            : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        }`}
                      >
                        {activeCategory.type === "PRODUCTION" ? "Produksi" : "Operasional"}
                      </span>
                    </div>
                  )}

                  {/* Item Description */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-foreground/85">Keterangan / Deskripsi Item *</Label>
                    <TextField
                      placeholder="Contoh: Pembelian Art Paper 150gr 20 rim"
                      className="h-10 border-border/50 focus:bg-background transition-all text-xs"
                      value={itemDescription}
                      onChange={(e) => setItemDescription(e.target.value)}
                    />
                  </div>

                  {/* Nominal Amount */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-foreground/85">Nominal Biaya (Rp) *</Label>
                    <TextField
                      type="number"
                      placeholder="Contoh: 12500000"
                      className="h-10 border-border/50 focus:bg-background transition-all font-bold text-right text-primary text-xs"
                      value={itemAmount}
                      onChange={(e) => setItemAmount(e.target.value)}
                    />
                  </div>

                  {/* Add/Edit Action Button */}
                  <div className="pt-2 flex gap-2">
                    <Button
                      type="button"
                      className={`flex-1 h-10 rounded-xl font-bold text-white shadow-sm flex items-center justify-center gap-1.5 active:scale-95 transition-all text-xs ${
                        editingItemId ? "bg-emerald-600 hover:bg-emerald-500" : "bg-primary hover:bg-primary/95"
                      }`}
                      onClick={handleAddOrUpdateItem}
                    >
                      {editingItemId ? (
                        <>
                          <LuPencil size={14} />
                          Perbarui Item
                        </>
                      ) : (
                        <>
                          <LuPlus size={14} />
                          Masukkan Ke Nota
                        </>
                      )}
                    </Button>
                    
                    {editingItemId && (
                      <Button
                        type="button"
                        variant="outline"
                        className="h-10 px-3 rounded-xl border-border/50 hover:bg-muted active:scale-95 transition-all text-xs"
                        onClick={() => {
                          setEditingItemId(null);
                          setItemDescription("");
                          setItemCategoryId("");
                          setItemAmount("");
                        }}
                      >
                        Batal
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT PANEL: Bill Metadata, Item Table List, and Payments Summary (Col span: 7/12) */}
            <div className="lg:col-span-7 p-6 space-y-6 flex flex-col justify-between">
              
              {/* Bill Metadata Grid */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-muted/20 p-4 rounded-2xl border border-border/40">
                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold text-muted-foreground uppercase">Tanggal Nota</Label>
                    <DatePicker
                      disabled={readOnly}
                      className="h-9 border-border/40 text-xs bg-background"
                      value={date ? new Date(`${date}T00:00:00`) : undefined}
                      onChange={(newVal) => setDate(newVal ? toLocalDateString(newVal) : "")}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold text-muted-foreground uppercase">No. Nota / Faktur</Label>
                    <TextField
                      disabled={readOnly}
                      placeholder="Contoh: INV/2026/06/001"
                      className="h-9 border-border/40 focus:bg-background transition-all font-semibold text-xs"
                      value={billNumber}
                      onChange={(e) => setBillNumber(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold text-muted-foreground uppercase">Supplier / Vendor</Label>
                    {readOnly ? (
                      <div className="h-9 flex items-center font-bold text-xs">
                        {supplierName}
                      </div>
                    ) : (
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setIsManualSupplier(false);
                            setSupplierName("");
                            setSupplierId("");
                          }}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all active:scale-90 ${
                            !isManualSupplier
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-background text-muted-foreground border-border hover:bg-muted/30"
                          }`}
                        >
                          Daftar
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsManualSupplier(true);
                            setSupplierName("");
                            setSupplierId("");
                          }}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all active:scale-90 ${
                            isManualSupplier
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-background text-muted-foreground border-border hover:bg-muted/30"
                          }`}
                        >
                          Manual
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Supplier input selector based on type */}
                {!readOnly && (
                  <div className="animate-in fade-in duration-300">
                    {isManualSupplier ? (
                      <TextField
                        placeholder="Nama Supplier (Manual)"
                        className="border-border/50 focus:bg-background transition-all font-medium text-xs h-9"
                        value={supplierName}
                        onChange={(e) => setSupplierName(e.target.value)}
                        required
                      />
                    ) : (
                      <Combobox value={supplierId} onValueChange={setSupplierId}>
                        <ComboboxTrigger className="font-semibold w-full h-9 border rounded-xl px-3 border-border/50 text-xs bg-background text-left flex items-center justify-between">
                          <span>
                            {SUPPLIERS.find((s) => s.id === supplierId)?.name || "-- Pilih Supplier Terdaftar --"}
                          </span>
                        </ComboboxTrigger>
                        <ComboboxContent className="w-[var(--radix-popover-trigger-width)] bg-background border border-border/80 shadow-lg rounded-xl overflow-hidden z-[10000]">
                          <ComboboxInput placeholder="Cari Supplier..." />
                          <ComboboxEmpty>Supplier tidak ditemukan.</ComboboxEmpty>
                          <ComboboxList className="max-h-48 overflow-y-auto p-1">
                            {SUPPLIERS.map((sup) => (
                              <ComboboxItem key={sup.id} value={sup.id}>
                                {sup.name}
                              </ComboboxItem>
                            ))}
                          </ComboboxList>
                        </ComboboxContent>
                      </Combobox>
                    )}
                  </div>
                )}

                {/* Items Table List */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center pb-1 border-b border-border/40">
                    <span className="text-xs font-bold text-foreground">Daftar Item Belanja ({items.length})</span>
                  </div>
                  
                  <div className="border border-border/40 rounded-xl overflow-hidden max-h-[220px] overflow-y-auto bg-card">
                    <Table>
                      <TableHeader className="bg-muted/30 sticky top-0 z-10">
                        <TableRow>
                          <TableHead className="font-bold text-[10px] py-2">Item</TableHead>
                          <TableHead className="font-bold text-[10px] py-2">Kategori</TableHead>
                          <TableHead className="font-bold text-[10px] py-2 text-right">Nominal</TableHead>
                          {!readOnly && <TableHead className="text-right font-bold text-[10px] py-2 pr-4">Aksi</TableHead>}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {items.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={readOnly ? 3 : 4} className="text-center py-6 text-xs text-muted-foreground font-medium">
                              Belum ada item belanja. Gunakan panel kiri untuk menambahkan.
                            </TableCell>
                          </TableRow>
                        ) : (
                          items.map((item, idx) => (
                            <TableRow key={item.id} className="hover:bg-muted/10 transition-colors">
                              <TableCell className="py-2 text-xs font-semibold">
                                <div className="flex flex-col">
                                  <span>{item.description}</span>
                                  <span className="text-[9px] text-muted-foreground font-normal tracking-wide uppercase">
                                    {item.expenseType === "PRODUCTION" ? "Produksi" : "Operasional"}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="py-2 text-xs text-muted-foreground font-medium">
                                {item.categoryName}
                              </TableCell>
                              <TableCell className="py-2 text-xs font-bold text-right text-foreground">
                                {formatCurrency(item.amount)}
                              </TableCell>
                              {!readOnly && (
                                <TableCell className="py-2 text-right pr-4">
                                  <div className="flex items-center justify-end gap-1">
                                    <Button
                                      variant="ghost"
                                      type="button"
                                      className="h-7 w-7 p-0 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
                                      onClick={() => handleEditItem(item)}
                                    >
                                      <LuPencil size={12} />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      type="button"
                                      className="h-7 w-7 p-0 rounded-md text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                                      onClick={() => handleRemoveItem(item.id)}
                                    >
                                      <LuTrash2 size={12} />
                                    </Button>
                                  </div>
                                </TableCell>
                              )}
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* General notes & Downpayment splits */}
                <div className="space-y-4 pt-2 border-t border-border/30">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-foreground/80">Catatan Nota</Label>
                    <TextField
                      placeholder="Catatan umum nota..."
                      disabled={readOnly}
                      className="border-border/40 focus:bg-background transition-all text-xs h-10"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>

                  {/* Pricing / Payments calculations */}
                  <div className="bg-muted/30 p-4 rounded-2xl border border-border/40 space-y-3 flex flex-col">
                    <div className="space-y-3 text-xs">
                      <div className="flex justify-between items-center text-muted-foreground">
                        <span>Subtotal Belanja:</span>
                        <span className="font-semibold text-foreground">{formatCurrency(subtotal)}</span>
                      </div>

                      <div className="flex justify-between items-center text-muted-foreground gap-4">
                        <span>Potongan / Diskon:</span>
                        {readOnly ? (
                          <span className="font-semibold text-foreground">{formatCurrency(discountAmount)}</span>
                        ) : (
                          <div className="flex items-center gap-1.5 w-32 justify-end">
                            <span className="text-[10px] text-muted-foreground">Rp</span>
                            <TextField
                              type="number"
                              disabled={readOnly}
                              placeholder="0"
                              className="border-border/40 text-right font-semibold text-xs h-7 p-1 w-24 bg-background"
                              value={discount}
                              onChange={(e) => setDiscount(e.target.value)}
                            />
                          </div>
                        )}
                      </div>

                      {!bill && !readOnly && (
                        <div className="border-t border-border/20 pt-2 space-y-3">
                          {/* Toggle Split Payment */}
                          <div className="flex items-center justify-between py-1">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">Split Pembayaran</span>
                            <button
                              type="button"
                              onClick={() => {
                                setIsSplitPayment(!isSplitPayment);
                                setInitialPayment("0");
                                setSplitAmountCash("0");
                                setSplitAmountTransfer("0");
                              }}
                              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                isSplitPayment ? "bg-primary" : "bg-muted-foreground/30"
                              }`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                  isSplitPayment ? "translate-x-4" : "translate-x-0"
                                }`}
                              />
                            </button>
                          </div>

                          {!isSplitPayment ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <Label className="text-[10px] font-bold text-muted-foreground uppercase">Kas Uang Muka</Label>
                                <Combobox value={paymentAccount} onValueChange={setPaymentAccount}>
                                  <ComboboxTrigger className="font-medium w-full h-8 border rounded-lg px-2 border-border/40 text-[11px] bg-background text-left flex items-center justify-between">
                                    <span>{paymentAccount || "-- Pilih Kas --"}</span>
                                  </ComboboxTrigger>
                                  <ComboboxContent className="w-[180px] bg-background border border-border/80 shadow-lg rounded-xl overflow-hidden z-[10000]">
                                    <ComboboxList className="p-1">
                                      <ComboboxItem value="Cash">Kas Tunai (Cash)</ComboboxItem>
                                      <ComboboxItem value="Transfer">Bank Transfer</ComboboxItem>
                                    </ComboboxList>
                                  </ComboboxContent>
                                </Combobox>
                              </div>
                              
                              <div className="space-y-1">
                                <Label className="text-[10px] font-bold text-muted-foreground uppercase">Nominal Bayar Awal (Rp)</Label>
                                <TextField
                                  type="number"
                                  placeholder="0"
                                  className="border-border/40 text-right font-bold text-xs h-8"
                                  value={initialPayment}
                                  onChange={(e) => setInitialPayment(e.target.value)}
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in duration-300">
                              <div className="space-y-1">
                                <Label className="text-[10px] font-bold text-muted-foreground uppercase">Nominal Tunai (Cash)</Label>
                                <TextField
                                  type="number"
                                  placeholder="0"
                                  className="border-border/40 text-right font-bold text-xs h-8"
                                  value={splitAmountCash}
                                  onChange={(e) => setSplitAmountCash(e.target.value)}
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-[10px] font-bold text-muted-foreground uppercase">Nominal Transfer (Bank)</Label>
                                <TextField
                                  type="number"
                                  placeholder="0"
                                  className="border-border/40 text-right font-bold text-xs h-8"
                                  value={splitAmountTransfer}
                                  onChange={(e) => setSplitAmountTransfer(e.target.value)}
                                />
                              </div>
                            </div>
                          )}

                          {/* Live balance indicator */}
                          <div className="border-t border-border/20 pt-2.5 space-y-2.5">
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-muted-foreground font-medium">Total Dibayar:</span>
                              <span className="font-semibold text-foreground">{formatCurrency(livePaidAmount)}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-muted-foreground font-medium">Sisa Pembayaran:</span>
                              <span className={`font-bold ${isLunas ? "text-emerald-600" : "text-amber-600 font-extrabold"}`}>
                                {formatCurrency(liveRemaining)}
                              </span>
                            </div>
                            {liveChange > 0 && (
                              <div className="flex justify-between items-center text-xs animate-in slide-in-from-top-1 duration-200">
                                <span className="text-emerald-600 font-medium">Uang Kembalian:</span>
                                <span className="font-extrabold text-emerald-600">
                                  {formatCurrency(liveChange)}
                                </span>
                              </div>
                            )}
                            <div className="flex items-center justify-between pt-1 border-t border-border/10">
                              <span className="text-[10px] font-bold text-muted-foreground uppercase">Status Transaksi:</span>
                              {isLunas ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                  Lunas (Langsung Lunas)
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                  Hutang (Tempo)
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Display payment history if edit mode */}
                      {(bill || readOnly) && (
                        <div className="border-t border-border/20 pt-2 space-y-1.5 text-[11px]">
                          <div className="flex justify-between text-emerald-600 font-semibold">
                            <span>Telah Dibayar:</span>
                            <span>{formatCurrency(bill?.paidAmount || 0)}</span>
                          </div>
                          <div className="flex justify-between text-rose-600 font-bold border-t border-border/20 pt-1.5">
                            <span>Sisa Hutang:</span>
                            <span>
                              {formatCurrency(
                                bill?.paymentStatus === "VOID"
                                  ? 0
                                  : Math.max(0, (bill?.totalAmount || 0) - (bill?.paidAmount || 0))
                              )}
                            </span>
                          </div>
                          <div className="flex items-center justify-between pt-1 border-t border-border/10">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">Status Transaksi:</span>
                            {((bill?.totalAmount || 0) - (bill?.paidAmount || 0) <= 0) ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                Lunas
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                Hutang
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center bg-primary/10 border border-primary/20 p-2.5 rounded-xl mt-3">
                      <span className="text-[10px] font-bold text-primary uppercase">Total Belanja</span>
                      <span className="text-base font-black text-foreground">{formatCurrency(totalAmount)}</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </CardContent>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border/50 flex justify-end gap-3 bg-muted/20">
          <Button
            variant="outline"
            className="h-10 px-4 rounded-xl font-medium border-border/50 hover:bg-muted active:scale-95 transition-all text-xs"
            type="button"
            onClick={onClose}
          >
            {readOnly ? "Tutup" : "Batal"}
          </Button>
          {!readOnly && (
            <Button
              className="h-10 px-4 rounded-xl font-bold bg-primary hover:bg-primary/95 text-white active:scale-95 transition-all text-xs"
              type="submit"
            >
              {bill ? "Perbarui Nota" : "Simpan Nota"}
            </Button>
          )}
        </div>
      </form>
    </Dialog>
  );
};

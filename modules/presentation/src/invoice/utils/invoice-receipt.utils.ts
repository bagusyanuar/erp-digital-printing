import type { Invoice } from "../hooks/useInvoice";
import type { SpkItemModel } from "@core/order/domains/models/order.model";

export interface InvoiceReceiptOptions {
  cashierName?: string;
  deadline?: string | null;
  memo?: string | null;
  charWidth?: number;
  tenderedAmount?: number;
  changeAmount?: number;
}

export const printFormatCurrency = (val: number): string => {
  const formattedNumber = new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 0,
  }).format(val);
  return `Rp ${formattedNumber}`;
};

export const formatLine = (
  left: string,
  right: string,
  charWidth = 48,
): string => {
  const spacesNeeded = charWidth - left.length - right.length;
  if (spacesNeeded > 0) {
    return left + " ".repeat(spacesNeeded) + right + "\n";
  }
  return (
    left +
    "\n" +
    " ".repeat(charWidth - right.length) +
    right +
    "\n"
  );
};

export const generateInvoiceReceiptRawData = (
  invoice: Invoice,
  options: InvoiceReceiptOptions = {},
): string => {
  const { cashierName = "Sistem", deadline, memo, charWidth = 48 } = options;

  // ESC/POS Command: Center Align
  let rawData = "\x1b\x61\x01";

  // ESC/POS Command: Print NV Bit Image #1 (normal mode)
  rawData += "\x1c\x70\x01\x00\n";

  rawData += "            MADE DIGITAL PRINTING           \n";
  rawData += " INDOOR - OUTDOOR - A3+ - DTF - SPANDUK KAIN \n";
  rawData += "   Jl. Kali Sindang, Jagalan, Jebres - Solo  \n";
  rawData += "     Buka : 08.00 (Pagi) - 01.00 (Malam)     \n";
  rawData += "               WA. 082134305050              \n";

  // ESC/POS Command: Left Align
  rawData += "\x1b\x61\x00";
  rawData += "------------------------------------------------\n";

  rawData += formatLine("Tanggal", invoice.createdAt, charWidth);
  rawData += formatLine("No. Transaksi", invoice.invoiceNo, charWidth);
  rawData += formatLine("Kasir", cashierName, charWidth);
  rawData += "------------------------------------------------\n\n";
  rawData += formatLine("Pelanggan", invoice.customerName.toUpperCase(), charWidth);
  if (invoice.designerName) {
    rawData += formatLine("Desainer", invoice.designerName.toUpperCase(), charWidth);
  }
  const cleanDeadline = (deadline ?? invoice.deadline ?? "").trim();
  if (cleanDeadline && cleanDeadline !== "-") {
    rawData += formatLine("Deadline", cleanDeadline, charWidth);
  }
  const cleanMemo = (memo ?? invoice.notes ?? "").trim();
  if (cleanMemo && cleanMemo !== "-") {
    rawData += formatLine("Memo Transaksi", cleanMemo, charWidth);
  }

  rawData += "------------------------------------------------\n";

  invoice.items.forEach((item) => {
    rawData += `${item.productName}\n`;
    if (item.notes && item.notes !== "-") {
      rawData += `* ${item.notes}\n`;
    }
    const leftDetail =
      item.uom === "m2" && item.lengthM && item.widthM
        ? `${item.lengthM}x${item.widthM} x ${item.qty} x ${printFormatCurrency(item.pricePerUnit)}`
        : item.uom === "m_lari" && item.lengthM
          ? `${item.lengthM} x ${item.qty} x ${printFormatCurrency(item.pricePerUnit)}`
          : `${item.qty} x ${printFormatCurrency(item.pricePerUnit)}`;
    const rightDetail = printFormatCurrency(item.subtotal);
    rawData += formatLine(leftDetail, rightDetail, charWidth);
    rawData += "\n";
  });

  rawData += "------------------------------------------------\n";

  const totalItemsText = `${invoice.items.length} item`;
  rawData += formatLine("Total Item", totalItemsText, charWidth);
  rawData += formatLine("Subtotal", printFormatCurrency(invoice.totalAmount), charWidth);

  rawData += "================================================\n";
  rawData += formatLine("TOTAL", printFormatCurrency(invoice.totalAmount), charWidth);
  rawData += "------------------------------------------------\n";

  const remaining = invoice.totalAmount - invoice.amountPaid;
  const paymentMethod = remaining <= 0 ? "Lunas" : "Piutang";
  rawData += formatLine("Metode Bayar", paymentMethod, charWidth);

  const displayPaid =
    options.tenderedAmount !== undefined && options.tenderedAmount > 0
      ? options.tenderedAmount
      : invoice.amountPaid;
  rawData += formatLine("Bayar", printFormatCurrency(displayPaid), charWidth);

  const displayChange =
    options.changeAmount !== undefined && options.changeAmount > 0
      ? options.changeAmount
      : options.tenderedAmount && options.tenderedAmount > invoice.totalAmount
        ? options.tenderedAmount - invoice.totalAmount
        : 0;

  if (displayChange > 0) {
    rawData += formatLine("Kembalian", printFormatCurrency(displayChange), charWidth);
  }

  if (remaining > 0) {
    rawData += formatLine("Sisa Tagihan", printFormatCurrency(remaining), charWidth);
  }

  rawData += "------------------------------------------------\n";

  // ESC/POS Command: Center Align
  rawData += "\x1b\x61\x01";
  rawData += "Terima kasih atas kunjungan Anda\n\n\n\n\n\n\n";

  // ESC/POS Command: Auto Cut
  rawData += "\x1d\x56\x00";

  return rawData;
};

export interface SpkPrintOptions {
  deadline?: string | null;
  memo?: string | null;
  charWidth?: number;
}

export const generateSpkRawData = (
  invoice: Invoice,
  categoryName: string,
  items: SpkItemModel[],
  options: SpkPrintOptions = {},
): string => {
  const { deadline, memo, charWidth = 48 } = options;

  // ESC/POS Command: Center Align
  let rawData = "\x1b\x61\x01";

  // Divisi: Double Height + Double Width + Bold using ESC ! 56
  rawData += "\x1b\x21\x38";
  rawData += `${categoryName.toUpperCase()}\n`;
  rawData += "\x1b\x21\x00"; // Reset print mode (standard size, normal weight)
  rawData += "\n";

  // ESC/POS Command: Left Align
  rawData += "\x1b\x61\x00";
  rawData += "\x1b\x21\x00"; // Ensure standard mode is applied again
  rawData += "------------------------------------------------\n";

  rawData += formatLine("No. Nota", invoice.invoiceNo, charWidth);
  rawData += formatLine("No. Tiket", invoice.jobNumber, charWidth);
  rawData += formatLine("Tanggal", invoice.createdAt, charWidth);
  rawData += "------------------------------------------------\n\n";
  rawData += formatLine(
    "Pelanggan",
    invoice.customerName.toUpperCase(),
    charWidth,
  );

  const cleanDeadline = (deadline ?? invoice.deadline ?? "").trim();
  if (cleanDeadline && cleanDeadline !== "-") {
    rawData += formatLine("Deadline", cleanDeadline, charWidth);
  }

  const cleanMemo = (memo ?? invoice.notes ?? "").trim();
  if (cleanMemo && cleanMemo !== "-") {
    rawData += formatLine("Memo Transaksi", cleanMemo, charWidth);
  }

  rawData += "------------------------------------------------\n";

  // Label: DAFTAR ITEM PRODUKSI (Normal)
  rawData += "DAFTAR ITEM PRODUKSI:\n";
  rawData += "------------------------------------------------\n";

  items.forEach((item, idx) => {
    // Item Name (Normal size, Not Bold)
    const itemTitle =
      item.variant_name && item.variant_name.toLowerCase() !== "default"
        ? `${idx + 1}. ${item.product_name} (${item.variant_name})`
        : `${idx + 1}. ${item.product_name}`;
    rawData += `${itemTitle}\n`;

    const hasDimensions =
      item.uom === "m2"
        ? item.length_m && item.width_m
        : item.uom === "m_lari"
          ? !!item.length_m
          : false;

    if (hasDimensions) {
      // 1. Catatan
      if (
        item.production_notes &&
        item.production_notes !== "-" &&
        item.production_notes !== ""
      ) {
        rawData += `   CATATAN: ${item.production_notes}\n`;
      }

      // 2. Ukuran (in meters)
      const lengthM = item.length_m ?? 0;
      if (item.uom === "m_lari") {
        rawData += `   UKURAN: ${lengthM} meter (m_lari)\n`;
      } else {
        const widthM = item.width_m ?? 0;
        rawData += `   UKURAN: ${lengthM} x ${widthM} meter\n`;
      }

      // 3. Quantity
      rawData += `   JUMLAH: ${item.quantity} pcs\n`;
    } else {
      // 1. Quantity
      rawData += `   JUMLAH: ${item.quantity} ${item.uom || "pcs"}\n`;

      // 2. Catatan
      if (
        item.production_notes &&
        item.production_notes !== "-" &&
        item.production_notes !== ""
      ) {
        rawData += `   CATATAN: ${item.production_notes}\n`;
      }
    }

    rawData += "------------------------------------------------\n";
  });

  rawData += "\n";
  // ESC/POS Command: Center Align
  rawData += "\x1b\x61\x01";
  if (invoice.designerName) {
    rawData += `DESAINER: ${invoice.designerName.toUpperCase()}\n\n`;
  }
  rawData += "--- HARAP DIKERJAKAN SESUAI SPESIFIKASI ---\n";
  rawData += "Sistem ERP Digital Printing\n";
  rawData += "\n\n\n\n\n\n\n";

  // ESC/POS Command: Auto Cut
  rawData += "\x1d\x56\x00";

  return rawData;
};

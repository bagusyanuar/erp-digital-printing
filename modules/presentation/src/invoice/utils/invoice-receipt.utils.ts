import type { Invoice } from "../hooks/useInvoice";

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
  if (deadline) {
    rawData += formatLine("Deadline", deadline, charWidth);
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

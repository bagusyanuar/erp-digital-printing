import type { PaginatedResponse } from "@core/shared/api/pagination";
import type {
  CustomerReceivableModel,
  CustomerReceivableSummaryModel,
  ReceivableInvoiceItemModel,
  SettledInvoiceReceivableModel,
} from "@core/receivable/domains/models/receivable.model";
import type {
  CustomerReceivableParams,
  SettledReceivableParams,
  PayCustomerInvoiceInput,
} from "@core/receivable/applications/inputs/receivable.input";
import type { ReceivableRepository } from "@core/receivable/domains/repositories/receivable.repository";

function calculateDaysOverdue(dueDateStr?: string): { days: number; isOverdue: boolean } {
  if (!dueDateStr) return { days: 0, isOverdue: false };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDateStr);
  if (isNaN(due.getTime())) return { days: 0, isOverdue: false };
  due.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - due.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays > 0) {
    return { days: diffDays, isOverdue: true };
  }
  return { days: 0, isOverdue: false };
}

function getTodayDateStr(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export class MockReceivableRepository implements ReceivableRepository {
  private customers: CustomerReceivableModel[] = [
    {
      id: "cust-001",
      customerName: "CV Media Citra Grafika",
      customerPhone: "081234567890",
      customerType: "RESELLER",
      totalInvoicesCount: 3,
      unpaidInvoicesCount: 3,
      totalAmount: 8800000,
      totalPaid: 2000000,
      totalRemaining: 6800000,
      hasOverdue: true,
      maxDaysOverdue: 8,
      oldestDueDate: "2026-10-30",
      invoices: [
        {
          id: "inv-001",
          invoiceNumber: "INV-2026-0045",
          jobNumber: "JOB-2026-0129",
          orderDate: "2026-10-15",
          dueDate: "2026-10-30",
          daysOverdue: 8,
          isOverdue: true,
          totalAmount: 4850000,
          amountPaid: 1500000,
          remainingAmount: 3350000,
          paymentStatus: "PARTIAL",
          notes: "Cetak Banner Flexi Korin 380gsm 40 pcs & Sticker Vinyl Ritrama",
          payments: [
            {
              id: "pay-101",
              receivableInvoiceId: "inv-001",
              amount: 1500000,
              paymentMethod: "transfer",
              cashierName: "Ahmad Kasir",
              paymentDate: "2026-10-15 14:20:00",
              notes: "DP Pekerjaan 30%",
            },
          ],
        },
        {
          id: "inv-002",
          invoiceNumber: "INV-2026-0082",
          jobNumber: "JOB-2026-0195",
          orderDate: "2026-10-28",
          dueDate: "2026-11-10",
          daysOverdue: 0,
          isOverdue: false,
          totalAmount: 2700000,
          amountPaid: 0,
          remainingAmount: 2700000,
          paymentStatus: "UNPAID",
          notes: "Sticker Ritrama Glossy 15 Roll (Print & Cut Roland)",
          payments: [],
        },
        {
          id: "inv-003",
          invoiceNumber: "INV-2026-0095",
          jobNumber: "JOB-2026-0210",
          orderDate: "2026-11-01",
          dueDate: "2026-11-14",
          daysOverdue: 0,
          isOverdue: false,
          totalAmount: 1250000,
          amountPaid: 500000,
          remainingAmount: 750000,
          paymentStatus: "PARTIAL",
          notes: "Kartu Nama Premium Soft Touch 50 Box (Foil Emas)",
          payments: [
            {
              id: "pay-102",
              receivableInvoiceId: "inv-003",
              amount: 500000,
              paymentMethod: "cash",
              cashierName: "Siti Rahma",
              paymentDate: "2026-11-01 11:30:00",
              notes: "Uang muka tunai",
            },
          ],
        },
      ],
    },
    {
      id: "cust-002",
      customerName: "PT Bintang Abadi Sejahtera",
      customerPhone: "085678901234",
      customerType: "RETAIL",
      totalInvoicesCount: 1,
      unpaidInvoicesCount: 1,
      totalAmount: 7200000,
      totalPaid: 0,
      totalRemaining: 7200000,
      hasOverdue: true,
      maxDaysOverdue: 3,
      oldestDueDate: "2026-11-04",
      invoices: [
        {
          id: "inv-004",
          invoiceNumber: "INV-2026-0052",
          jobNumber: "JOB-2026-0140",
          orderDate: "2026-10-20",
          dueDate: "2026-11-04",
          daysOverdue: 3,
          isOverdue: true,
          totalAmount: 7200000,
          amountPaid: 0,
          remainingAmount: 7200000,
          paymentStatus: "UNPAID",
          notes: "Branding Mobil Box 2 Unit (Sticker Orajet + Laminasi Glossy)",
          payments: [],
        },
      ],
    },
    {
      id: "cust-003",
      customerName: "Duta Kreasi Advertising",
      customerPhone: "087812345678",
      customerType: "RESELLER",
      totalInvoicesCount: 2,
      unpaidInvoicesCount: 2,
      totalAmount: 16300000,
      totalPaid: 6000000,
      totalRemaining: 10300000,
      hasOverdue: false,
      maxDaysOverdue: 0,
      oldestDueDate: "2026-11-15",
      invoices: [
        {
          id: "inv-005",
          invoiceNumber: "INV-2026-0061",
          jobNumber: "JOB-2026-0158",
          orderDate: "2026-10-25",
          dueDate: "2026-11-15",
          daysOverdue: 0,
          isOverdue: false,
          totalAmount: 12500000,
          amountPaid: 5000000,
          remainingAmount: 7500000,
          paymentStatus: "PARTIAL",
          notes: "Neon Box Akrilik 2 Sisi + Huruf Timbul Stainless Steel",
          payments: [
            {
              id: "pay-103",
              receivableInvoiceId: "inv-005",
              amount: 5000000,
              paymentMethod: "transfer",
              cashierName: "Siti Rahma",
              paymentDate: "2026-10-25 10:10:00",
              notes: "Down Payment Project Neon Box",
            },
          ],
        },
        {
          id: "inv-006",
          invoiceNumber: "INV-2026-0089",
          jobNumber: "JOB-2026-0205",
          orderDate: "2026-10-31",
          dueDate: "2026-11-18",
          daysOverdue: 0,
          isOverdue: false,
          totalAmount: 3800000,
          amountPaid: 1000000,
          remainingAmount: 2800000,
          paymentStatus: "PARTIAL",
          notes: "Backdrop Portable Magnetic Curve 3x3 + Lampu Halogen",
          payments: [
            {
              id: "pay-104",
              receivableInvoiceId: "inv-006",
              amount: 1000000,
              paymentMethod: "cash",
              cashierName: "Ahmad Kasir",
              paymentDate: "2026-10-31 16:00:00",
              notes: "DP Tunai Kasir",
            },
          ],
        },
      ],
    },
    {
      id: "cust-004",
      customerName: "Klinik Pratama Sehat Selalu",
      customerPhone: "081344556677",
      customerType: "RETAIL",
      totalInvoicesCount: 1,
      unpaidInvoicesCount: 1,
      totalAmount: 3400000,
      totalPaid: 1000000,
      totalRemaining: 2400000,
      hasOverdue: true,
      maxDaysOverdue: 13,
      oldestDueDate: "2026-10-25",
      invoices: [
        {
          id: "inv-007",
          invoiceNumber: "INV-2026-0078",
          jobNumber: "JOB-2026-0185",
          orderDate: "2026-10-10",
          dueDate: "2026-10-25",
          daysOverdue: 13,
          isOverdue: true,
          totalAmount: 3400000,
          amountPaid: 1000000,
          remainingAmount: 2400000,
          paymentStatus: "PARTIAL",
          notes: "Brosur Art Paper 150gsm 5 Rim + Kartu Berobat 2.000 pcs",
          payments: [
            {
              id: "pay-105",
              receivableInvoiceId: "inv-007",
              amount: 1000000,
              paymentMethod: "cash",
              cashierName: "Ahmad Kasir",
              paymentDate: "2026-10-10 11:00:00",
              notes: "Uang muka tunai",
            },
          ],
        },
      ],
    },
    {
      id: "cust-005",
      customerName: "Rumah Makan Padang Murah",
      customerPhone: "082199887766",
      customerType: "RETAIL",
      totalInvoicesCount: 1,
      unpaidInvoicesCount: 1,
      totalAmount: 1850000,
      totalPaid: 0,
      totalRemaining: 1850000,
      hasOverdue: false,
      maxDaysOverdue: 0,
      oldestDueDate: "2026-11-12",
      invoices: [
        {
          id: "inv-008",
          invoiceNumber: "INV-2026-0070",
          jobNumber: "JOB-2026-0172",
          orderDate: "2026-11-02",
          dueDate: "2026-11-12",
          daysOverdue: 0,
          isOverdue: false,
          totalAmount: 1850000,
          amountPaid: 0,
          remainingAmount: 1850000,
          paymentStatus: "UNPAID",
          notes: "Cetak Buku Menu Hardcover 20 pcs & Banner Daftar Menu",
          payments: [],
        },
      ],
    },
    // Historical Settled Customers (Tab Riwayat Piutang)
    {
      id: "cust-006",
      customerName: "Sentosa Offset & Printing",
      customerPhone: "081987654321",
      customerType: "RESELLER",
      totalInvoicesCount: 2,
      unpaidInvoicesCount: 0,
      totalAmount: 9700000,
      totalPaid: 9700000,
      totalRemaining: 0,
      hasOverdue: false,
      maxDaysOverdue: 0,
      oldestDueDate: "2026-09-25",
      invoices: [
        {
          id: "inv-009",
          invoiceNumber: "INV-2026-0021",
          jobNumber: "JOB-2026-0080",
          orderDate: "2026-09-10",
          dueDate: "2026-09-25",
          daysOverdue: 0,
          isOverdue: false,
          totalAmount: 6500000,
          amountPaid: 6500000,
          remainingAmount: 0,
          paymentStatus: "PAID",
          notes: "Cetak Kalender Dinding 2027 Spiral Kawat 500 pcs",
          payments: [
            {
              id: "pay-106",
              receivableInvoiceId: "inv-009",
              amount: 2500000,
              paymentMethod: "transfer",
              cashierName: "Siti Rahma",
              paymentDate: "2026-09-10 09:30:00",
              notes: "DP 40%",
            },
            {
              id: "pay-107",
              receivableInvoiceId: "inv-009",
              amount: 4000000,
              paymentMethod: "transfer",
              cashierName: "Siti Rahma",
              paymentDate: "2026-09-24 16:15:00",
              notes: "Pelunasan via transfer BCA",
            },
          ],
        },
        {
          id: "inv-010",
          invoiceNumber: "INV-2026-0012",
          jobNumber: "JOB-2026-0044",
          orderDate: "2026-08-15",
          dueDate: "2026-08-30",
          daysOverdue: 0,
          isOverdue: false,
          totalAmount: 3200000,
          amountPaid: 3200000,
          remainingAmount: 0,
          paymentStatus: "PAID",
          notes: "Plakat Akrilik Wisuda 80 pcs Laser Engrave",
          payments: [
            {
              id: "pay-108",
              receivableInvoiceId: "inv-010",
              amount: 3200000,
              paymentMethod: "cash",
              cashierName: "Ahmad Kasir",
              paymentDate: "2026-08-29 14:00:00",
              notes: "Lunas tunai",
            },
          ],
        },
      ],
    },
    {
      id: "cust-007",
      customerName: "Yayasan Bina Bangsa",
      customerPhone: "085233445566",
      customerType: "RETAIL",
      totalInvoicesCount: 1,
      unpaidInvoicesCount: 0,
      totalAmount: 4200000,
      totalPaid: 4200000,
      totalRemaining: 0,
      hasOverdue: false,
      maxDaysOverdue: 0,
      oldestDueDate: "2026-10-06",
      invoices: [
        {
          id: "inv-011",
          invoiceNumber: "INV-2026-0033",
          jobNumber: "JOB-2026-0099",
          orderDate: "2026-09-22",
          dueDate: "2026-10-06",
          daysOverdue: 0,
          isOverdue: false,
          totalAmount: 4200000,
          amountPaid: 4200000,
          remainingAmount: 0,
          paymentStatus: "PAID",
          notes: "Kaos Sablon DTF Event Lomba 120 pcs",
          payments: [
            {
              id: "pay-109",
              receivableInvoiceId: "inv-011",
              amount: 2000000,
              paymentMethod: "transfer",
              cashierName: "Ahmad Kasir",
              paymentDate: "2026-09-22 13:00:00",
              notes: "Uang muka transfer",
            },
            {
              id: "pay-110",
              receivableInvoiceId: "inv-011",
              amount: 2200000,
              paymentMethod: "cash",
              cashierName: "Ahmad Kasir",
              paymentDate: "2026-10-05 15:45:00",
              notes: "Pelunasan tunai saat ambil barang",
            },
          ],
        },
      ],
    },
    {
      id: "cust-008",
      customerName: "Bimbingan Belajar Cerdas Mulia",
      customerPhone: "085711223344",
      customerType: "RETAIL",
      totalInvoicesCount: 1,
      unpaidInvoicesCount: 0,
      totalAmount: 2350000,
      totalPaid: 2350000,
      totalRemaining: 0,
      hasOverdue: false,
      maxDaysOverdue: 0,
      oldestDueDate: getTodayDateStr(),
      invoices: [
        {
          id: "inv-012",
          invoiceNumber: "INV-2026-0105",
          jobNumber: "JOB-2026-0220",
          orderDate: getTodayDateStr(),
          dueDate: getTodayDateStr(),
          daysOverdue: 0,
          isOverdue: false,
          totalAmount: 2350000,
          amountPaid: 2350000,
          remainingAmount: 0,
          paymentStatus: "PAID",
          notes: "Cetak Modul Pembelajaran Semester Ganjil 150 Buku",
          payments: [
            {
              id: "pay-111",
              receivableInvoiceId: "inv-012",
              amount: 2350000,
              paymentMethod: "transfer",
              cashierName: "Ahmad Kasir",
              paymentDate: `${getTodayDateStr()} 10:15:00`,
              notes: "Pelunasan transfer BCA",
            },
          ],
        },
      ],
    },
  ];

  async getCustomerReceivables(
    params: CustomerReceivableParams,
  ): Promise<PaginatedResponse<CustomerReceivableModel>> {
    // Recalculate dynamic values per invoice and customer
    const computedList = this.customers.map((cust) => {
      let totalAmount = 0;
      let totalPaid = 0;
      let totalRemaining = 0;
      let unpaidCount = 0;
      let hasOverdue = false;
      let maxDaysOverdue = 0;
      let oldestDueDate = "";

      const updatedInvoices = cust.invoices.map((inv) => {
        totalAmount += inv.totalAmount;
        totalPaid += inv.amountPaid;
        totalRemaining += inv.remainingAmount;

        if (inv.remainingAmount > 0) {
          unpaidCount++;
          const { days, isOverdue } = calculateDaysOverdue(inv.dueDate);
          if (isOverdue) {
            hasOverdue = true;
            if (days > maxDaysOverdue) maxDaysOverdue = days;
          }
          if (inv.dueDate && (!oldestDueDate || inv.dueDate < oldestDueDate)) {
            oldestDueDate = inv.dueDate;
          }
          return {
            ...inv,
            daysOverdue: days,
            isOverdue,
          };
        }

        return inv;
      });

      return {
        ...cust,
        totalInvoicesCount: cust.invoices.length,
        unpaidInvoicesCount: unpaidCount,
        totalAmount,
        totalPaid,
        totalRemaining,
        hasOverdue,
        maxDaysOverdue,
        oldestDueDate: oldestDueDate || cust.oldestDueDate,
        invoices: updatedInvoices,
      };
    });

    let filtered = computedList.filter((cust) => {
      if (params.tab === "ACTIVE") {
        return cust.totalRemaining > 0;
      }
      return cust.totalRemaining === 0;
    });

    // Search by Customer Name, Phone, or even Invoice/Job numbers
    if (params.search && params.search.trim() !== "") {
      const q = params.search.toLowerCase().trim();
      filtered = filtered.filter((cust) => {
        const matchName = cust.customerName.toLowerCase().includes(q);
        const matchPhone = cust.customerPhone.includes(q);
        const matchInvoice = cust.invoices.some(
          (inv) =>
            inv.invoiceNumber.toLowerCase().includes(q) ||
            inv.jobNumber.toLowerCase().includes(q) ||
            (inv.notes && inv.notes.toLowerCase().includes(q)),
        );
        return matchName || matchPhone || matchInvoice;
      });
    }

    // Status filter
    if (params.tab === "ACTIVE" && params.status && params.status !== "ALL") {
      if (params.status === "OVERDUE") {
        filtered = filtered.filter((cust) => cust.hasOverdue);
      } else if (params.status === "PARTIAL") {
        filtered = filtered.filter((cust) => cust.totalPaid > 0 && cust.totalRemaining > 0);
      } else if (params.status === "UNPAID") {
        filtered = filtered.filter((cust) => cust.totalPaid === 0);
      }
    }

    const total = filtered.length;
    const page = params.page || 1;
    const limit = params.limit || 10;
    const startIndex = (page - 1) * limit;
    const pagedData = filtered.slice(startIndex, startIndex + limit);

    return {
      data: pagedData,
      total,
      page,
      limit,
    };
  }

  async getSettledReceivables(
    params: SettledReceivableParams,
  ): Promise<PaginatedResponse<SettledInvoiceReceivableModel>> {
    const settledList: SettledInvoiceReceivableModel[] = [];

    this.customers.forEach((cust) => {
      cust.invoices.forEach((inv) => {
        if (inv.remainingAmount === 0 && inv.paymentStatus === "PAID") {
          // Determine last payment date as settledDate
          const lastPayment = inv.payments[inv.payments.length - 1];
          const settledDate = lastPayment?.paymentDate || inv.orderDate;

          // Determine payment method label
          const uniqueMethods = Array.from(new Set(inv.payments.map((p) => p.paymentMethod)));
          const paymentMethod =
            uniqueMethods.length > 1
              ? "split"
              : uniqueMethods[0] || "cash";

          settledList.push({
            id: inv.id,
            customerId: cust.id,
            customerName: cust.customerName,
            customerPhone: cust.customerPhone,
            customerType: cust.customerType,
            invoiceNumber: inv.invoiceNumber,
            jobNumber: inv.jobNumber,
            orderDate: inv.orderDate,
            settledDate,
            totalAmount: inv.totalAmount,
            amountPaid: inv.amountPaid,
            paymentMethod,
            payments: inv.payments,
            notes: inv.notes,
          });
        }
      });
    });

    let filtered = settledList;

    // Filter search
    if (params.search && params.search.trim() !== "") {
      const q = params.search.toLowerCase().trim();
      filtered = filtered.filter(
        (item) =>
          item.invoiceNumber.toLowerCase().includes(q) ||
          item.jobNumber.toLowerCase().includes(q) ||
          item.customerName.toLowerCase().includes(q) ||
          item.customerPhone.includes(q),
      );
    }

    // Filter date range by settledDate
    if (params.startDate) {
      filtered = filtered.filter((item) => item.settledDate.split(" ")[0]! >= params.startDate!);
    }
    if (params.endDate) {
      filtered = filtered.filter((item) => item.settledDate.split(" ")[0]! <= params.endDate!);
    }

    // Sort by settledDate descending
    filtered.sort((a, b) => b.settledDate.localeCompare(a.settledDate));

    const total = filtered.length;
    const page = params.page || 1;
    const limit = params.limit || 10;
    const startIndex = (page - 1) * limit;
    const pagedData = filtered.slice(startIndex, startIndex + limit);

    return {
      data: pagedData,
      total,
      page,
      limit,
    };
  }

  async getCustomerReceivableSummary(): Promise<CustomerReceivableSummaryModel> {
    const activeList = this.customers.filter((c) => c.totalRemaining > 0);
    const settledList = this.customers.filter((c) => c.totalRemaining === 0);

    const totalActiveReceivable = activeList.reduce((acc, c) => acc + c.totalRemaining, 0);

    const totalOverdueReceivable = activeList
      .filter((c) => c.hasOverdue)
      .reduce((acc, c) => acc + c.totalRemaining, 0);

    const totalSettledReceivable = settledList.reduce((acc, c) => acc + c.totalAmount, 0);

    return {
      totalActiveReceivable,
      totalOverdueReceivable,
      totalSettledReceivable,
      activeCustomerCount: activeList.length,
    };
  }

  async payCustomerInvoice(
    input: PayCustomerInvoiceInput,
  ): Promise<{ customer: CustomerReceivableModel; invoice: ReceivableInvoiceItemModel }> {
    const custIndex = this.customers.findIndex((c) => c.id === input.customerId);
    if (custIndex === -1) {
      throw new Error(`Data customer dengan ID ${input.customerId} tidak ditemukan.`);
    }

    const cust = this.customers[custIndex]!;
    const invIndex = cust.invoices.findIndex((i) => i.id === input.invoiceId);
    if (invIndex === -1) {
      throw new Error(`Invoice dengan ID ${input.invoiceId} tidak ditemukan.`);
    }

    const targetInv = cust.invoices[invIndex]!;
    const validPayments = input.payments.filter((p) => p.amount > 0);
    const totalToPay = validPayments.reduce((sum, p) => sum + p.amount, 0);

    if (validPayments.length === 0 || totalToPay <= 0) {
      throw new Error("Nominal pembayaran harus lebih besar dari Rp 0.");
    }
    if (totalToPay > targetInv.remainingAmount) {
      throw new Error(
        `Total nominal pembayaran (Rp ${totalToPay.toLocaleString("id-ID")}) melebihi sisa nota (${targetInv.remainingAmount.toLocaleString("id-ID")}).`,
      );
    }

    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;

    const newPaymentRecords = validPayments.map((p, idx) => ({
      id: `pay-${Date.now()}-${idx}`,
      receivableInvoiceId: targetInv.id,
      amount: p.amount,
      paymentMethod: p.paymentMethod,
      cashierName: input.cashierName || "Kasir Keuangan",
      paymentDate: formattedDate,
    }));

    const newAmountPaid = targetInv.amountPaid + totalToPay;
    const newRemaining = targetInv.totalAmount - newAmountPaid;
    const newStatus = newRemaining === 0 ? "PAID" : "PARTIAL";

    const updatedInvoice: ReceivableInvoiceItemModel = {
      ...targetInv,
      amountPaid: newAmountPaid,
      remainingAmount: newRemaining,
      paymentStatus: newStatus,
      isOverdue: newRemaining > 0 && targetInv.isOverdue,
      payments: [...targetInv.payments, ...newPaymentRecords],
    };

    const updatedInvoices = [...cust.invoices];
    updatedInvoices[invIndex] = updatedInvoice;

    let newTotalRemaining = 0;
    let newTotalPaid = 0;
    let newUnpaidCount = 0;
    let newHasOverdue = false;

    updatedInvoices.forEach((inv) => {
      newTotalRemaining += inv.remainingAmount;
      newTotalPaid += inv.amountPaid;
      if (inv.remainingAmount > 0) {
        newUnpaidCount++;
        if (inv.isOverdue) newHasOverdue = true;
      }
    });

    const updatedCustomer: CustomerReceivableModel = {
      ...cust,
      invoices: updatedInvoices,
      totalPaid: newTotalPaid,
      totalRemaining: newTotalRemaining,
      unpaidInvoicesCount: newUnpaidCount,
      hasOverdue: newHasOverdue,
    };

    this.customers[custIndex] = updatedCustomer;

    return {
      customer: updatedCustomer,
      invoice: updatedInvoice,
    };
  }
}

import type { PaginatedResponse } from "@core/shared/api/pagination";
import type {
  VendorPayableModel,
  VendorPayableSummaryModel,
  PayableExpenseItemModel,
  SettledExpensePayableModel,
} from "@core/payable/domains/models/payable.model";
import type {
  VendorPayableParams,
  SettledPayableParams,
  PayVendorExpenseInput,
} from "@core/payable/applications/inputs/payable.input";
import type { PayableRepository } from "@core/payable/domains/repositories/payable.repository";

function calculateDaysOverdue(dueDateStr: string): { days: number; isOverdue: boolean } {
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

export class MockPayableRepository implements PayableRepository {
  private vendors: VendorPayableModel[] = [
    {
      id: "vnd-001",
      vendorName: "PT Graha Mulia Visual",
      vendorPhone: "081198761234",
      vendorCategory: "SUPPLIER",
      totalExpensesCount: 3,
      unpaidExpensesCount: 3,
      totalAmount: 24500000,
      totalPaid: 6500000,
      totalRemaining: 18000000,
      hasOverdue: true,
      maxDaysOverdue: 7,
      oldestDueDate: "2026-10-31",
      expenses: [
        {
          id: "exp-001",
          expenseNumber: "EXP-2026-0041",
          referenceNumber: "INV-GMV-8821",
          categoryName: "Bahan Baku & Media Cetak",
          expenseDate: "2026-10-14",
          dueDate: "2026-10-31",
          daysOverdue: 7,
          isOverdue: true,
          totalAmount: 12000000,
          amountPaid: 3500000,
          remainingAmount: 8500000,
          paymentStatus: "PARTIAL",
          notes: "Pembelian Bahan Vinyl Ritrama Glossy 20 Roll & Banner Frontlite Korin 380gsm 15 Roll",
          payments: [
            {
              id: "pay-v-101",
              payableExpenseId: "exp-001",
              amount: 3500000,
              paymentMethod: "transfer",
              recordedBy: "Budi Finance",
              paymentDate: "2026-10-14 11:20:00",
              sourceAccount: "BCA Operasional",
              notes: "Uang muka 30% pengiriman tahap 1",
            },
          ],
        },
        {
          id: "exp-002",
          expenseNumber: "EXP-2026-0062",
          referenceNumber: "INV-GMV-9014",
          categoryName: "Bahan Baku & Media Cetak",
          expenseDate: "2026-10-25",
          dueDate: "2026-11-12",
          daysOverdue: 0,
          isOverdue: false,
          totalAmount: 7500000,
          amountPaid: 3000000,
          remainingAmount: 4500000,
          paymentStatus: "PARTIAL",
          notes: "Laminasi Dingin Doff 10 Roll & Sticker Transparan Orajet 5 Roll",
          payments: [
            {
              id: "pay-v-102",
              payableExpenseId: "exp-002",
              amount: 3000000,
              paymentMethod: "transfer",
              recordedBy: "Budi Finance",
              paymentDate: "2026-10-25 15:00:00",
              sourceAccount: "Mandiri Bisnis",
              notes: "DP Invoice tempo 2 minggu",
            },
          ],
        },
        {
          id: "exp-003",
          expenseNumber: "EXP-2026-0085",
          referenceNumber: "INV-GMV-9210",
          categoryName: "Bahan Baku & Media Cetak",
          expenseDate: "2026-11-02",
          dueDate: "2026-11-16",
          daysOverdue: 0,
          isOverdue: false,
          totalAmount: 5000000,
          amountPaid: 0,
          remainingAmount: 5000000,
          paymentStatus: "UNPAID",
          notes: "Backlit Film Duratrans 125cm 4 Roll & Foam Board 5mm 30 Lembar",
          payments: [],
        },
      ],
    },
    {
      id: "vnd-002",
      vendorName: "CV Indo Tinta Grafika",
      vendorPhone: "081233445566",
      vendorCategory: "SUPPLIER",
      totalExpensesCount: 1,
      unpaidExpensesCount: 1,
      totalAmount: 14800000,
      totalPaid: 5000000,
      totalRemaining: 9800000,
      hasOverdue: true,
      maxDaysOverdue: 4,
      oldestDueDate: "2026-11-03",
      expenses: [
        {
          id: "exp-004",
          expenseNumber: "EXP-2026-0050",
          referenceNumber: "SJ-ITG-4402",
          categoryName: "Tinta & Solven",
          expenseDate: "2026-10-18",
          dueDate: "2026-11-03",
          daysOverdue: 4,
          isOverdue: true,
          totalAmount: 14800000,
          amountPaid: 5000000,
          remainingAmount: 9800000,
          paymentStatus: "PARTIAL",
          notes: "Tinta Eco-Solvent Roland CMYK (12 Liter) & Tinta UV Hard Ink (4 Botol)",
          payments: [
            {
              id: "pay-v-103",
              payableExpenseId: "exp-004",
              amount: 5000000,
              paymentMethod: "transfer",
              recordedBy: "Budi Finance",
              paymentDate: "2026-10-18 10:15:00",
              sourceAccount: "BCA Operasional",
              notes: "DP PO Tinta Produksi",
            },
          ],
        },
      ],
    },
    {
      id: "vnd-003",
      vendorName: "Bengkel Laser & Akrilik Presisi",
      vendorPhone: "087788990011",
      vendorCategory: "SUBKONTRAK",
      totalExpensesCount: 2,
      unpaidExpensesCount: 2,
      totalAmount: 8200000,
      totalPaid: 2000000,
      totalRemaining: 6200000,
      hasOverdue: false,
      maxDaysOverdue: 0,
      oldestDueDate: "2026-11-14",
      expenses: [
        {
          id: "exp-005",
          expenseNumber: "EXP-2026-0071",
          referenceNumber: "NOTA-BLA-1109",
          categoryName: "Subkontrak / Jasa Luar",
          expenseDate: "2026-10-29",
          dueDate: "2026-11-14",
          daysOverdue: 0,
          isOverdue: false,
          totalAmount: 5200000,
          amountPaid: 2000000,
          remainingAmount: 3200000,
          paymentStatus: "PARTIAL",
          notes: "Jasa Laser Cutting Akrilik Bening 8mm & Grafir Logo Event Pemkot (150 Unit)",
          payments: [
            {
              id: "pay-v-104",
              payableExpenseId: "exp-005",
              amount: 2000000,
              paymentMethod: "cash",
              recordedBy: "Budi Finance",
              paymentDate: "2026-10-29 13:40:00",
              sourceAccount: "Kas Kecil Workshop",
              notes: "DP Tunai di workshop vendor",
            },
          ],
        },
        {
          id: "exp-006",
          expenseNumber: "EXP-2026-0092",
          referenceNumber: "NOTA-BLA-1135",
          categoryName: "Subkontrak / Jasa Luar",
          expenseDate: "2026-11-04",
          dueDate: "2026-11-18",
          daysOverdue: 0,
          isOverdue: false,
          totalAmount: 3000000,
          amountPaid: 0,
          remainingAmount: 3000000,
          paymentStatus: "UNPAID",
          notes: "Pembuatan Rangka Hollow Galvanis Neon Box Ukuran 3x1.5m 2 Unit",
          payments: [],
        },
      ],
    },
    {
      id: "vnd-004",
      vendorName: "PT Global Sarana Mesin",
      vendorPhone: "081399881122",
      vendorCategory: "MAINTENANCE",
      totalExpensesCount: 1,
      unpaidExpensesCount: 1,
      totalAmount: 18500000,
      totalPaid: 5000000,
      totalRemaining: 13500000,
      hasOverdue: true,
      maxDaysOverdue: 10,
      oldestDueDate: "2026-10-28",
      expenses: [
        {
          id: "exp-007",
          expenseNumber: "EXP-2026-0038",
          referenceNumber: "INV-GSM-9021",
          categoryName: "Sparepart & Perawatan Mesin",
          expenseDate: "2026-10-10",
          dueDate: "2026-10-28",
          daysOverdue: 10,
          isOverdue: true,
          totalAmount: 18500000,
          amountPaid: 5000000,
          remainingAmount: 13500000,
          paymentStatus: "PARTIAL",
          notes: "Penggantian Printhead Konica Minolta KM512i LNB + Kalibrasi Mesin Outdoor",
          payments: [
            {
              id: "pay-v-105",
              payableExpenseId: "exp-007",
              amount: 5000000,
              paymentMethod: "transfer",
              recordedBy: "Budi Finance",
              paymentDate: "2026-10-10 16:30:00",
              sourceAccount: "BCA Operasional",
              notes: "Down payment servis teknisi",
            },
          ],
        },
      ],
    },
    {
      id: "vnd-005",
      vendorName: "Jahit & Mata Ayam Spanduk Berkah",
      vendorPhone: "085811223344",
      vendorCategory: "SUBKONTRAK",
      totalExpensesCount: 1,
      unpaidExpensesCount: 1,
      totalAmount: 2100000,
      totalPaid: 0,
      totalRemaining: 2100000,
      hasOverdue: false,
      maxDaysOverdue: 0,
      oldestDueDate: "2026-11-12",
      expenses: [
        {
          id: "exp-008",
          expenseNumber: "EXP-2026-0089",
          referenceNumber: "KWT-JSB-055",
          categoryName: "Subkontrak / Jasa Luar",
          expenseDate: "2026-11-03",
          dueDate: "2026-11-12",
          daysOverdue: 0,
          isOverdue: false,
          totalAmount: 2100000,
          amountPaid: 0,
          remainingAmount: 2100000,
          paymentStatus: "UNPAID",
          notes: "Jasa Jahit Keliling Banner Pilkada 1.200 meter & Pasang Keling Siku",
          payments: [],
        },
      ],
    },
    // Historical Settled Vendors (Lunas)
    {
      id: "vnd-006",
      vendorName: "PT Maju Perkasa Paperindo",
      vendorPhone: "081822334455",
      vendorCategory: "SUPPLIER",
      totalExpensesCount: 2,
      unpaidExpensesCount: 0,
      totalAmount: 16500000,
      totalPaid: 16500000,
      totalRemaining: 0,
      hasOverdue: false,
      maxDaysOverdue: 0,
      oldestDueDate: "2026-09-30",
      expenses: [
        {
          id: "exp-009",
          expenseNumber: "EXP-2026-0015",
          referenceNumber: "INV-MPP-7721",
          categoryName: "Bahan Baku & Kertas",
          expenseDate: "2026-09-12",
          dueDate: "2026-09-30",
          daysOverdue: 0,
          isOverdue: false,
          totalAmount: 11000000,
          amountPaid: 11000000,
          remainingAmount: 0,
          paymentStatus: "PAID",
          notes: "Kertas Art Carton 260gsm 80 Rim & Ivory 310gsm 40 Rim",
          payments: [
            {
              id: "pay-v-106",
              payableExpenseId: "exp-009",
              amount: 5000000,
              paymentMethod: "transfer",
              recordedBy: "Budi Finance",
              paymentDate: "2026-09-12 10:00:00",
              sourceAccount: "Mandiri Bisnis",
              notes: "DP PO Kertas",
            },
            {
              id: "pay-v-107",
              payableExpenseId: "exp-009",
              amount: 6000000,
              paymentMethod: "transfer",
              recordedBy: "Budi Finance",
              paymentDate: "2026-09-29 14:15:00",
              sourceAccount: "BCA Operasional",
              notes: "Pelunasan tempo transfer BCA",
            },
          ],
        },
        {
          id: "exp-010",
          expenseNumber: "EXP-2026-0022",
          referenceNumber: "INV-MPP-7804",
          categoryName: "Bahan Baku & Kertas",
          expenseDate: "2026-09-20",
          dueDate: "2026-10-05",
          daysOverdue: 0,
          isOverdue: false,
          totalAmount: 5500000,
          amountPaid: 5500000,
          remainingAmount: 0,
          paymentStatus: "PAID",
          notes: "Kertas Samson Kraft 150gsm 50 Rim untuk Paper Bag",
          payments: [
            {
              id: "pay-v-108",
              payableExpenseId: "exp-010",
              amount: 5500000,
              paymentMethod: "transfer",
              recordedBy: "Budi Finance",
              paymentDate: "2026-10-04 11:30:00",
              sourceAccount: "BCA Operasional",
              notes: "Pelunasan via transfer",
            },
          ],
        },
      ],
    },
    {
      id: "vnd-007",
      vendorName: "CV Surya Abadi Listrik & Teknik",
      vendorPhone: "082233119900",
      vendorCategory: "OPERASIONAL",
      totalExpensesCount: 1,
      unpaidExpensesCount: 0,
      totalAmount: 4600000,
      totalPaid: 4600000,
      totalRemaining: 0,
      hasOverdue: false,
      maxDaysOverdue: 0,
      oldestDueDate: "2026-10-15",
      expenses: [
        {
          id: "exp-011",
          expenseNumber: "EXP-2026-0030",
          referenceNumber: "INV-SALT-3312",
          categoryName: "Listrik & Instalasi Panel",
          expenseDate: "2026-10-01",
          dueDate: "2026-10-15",
          daysOverdue: 0,
          isOverdue: false,
          totalAmount: 4600000,
          amountPaid: 4600000,
          remainingAmount: 0,
          paymentStatus: "PAID",
          notes: "Penambahan Jalur Kabel 3 Phase & MCB Ruang Mesin Cetak Baru",
          payments: [
            {
              id: "pay-v-109",
              payableExpenseId: "exp-011",
              amount: 4600000,
              paymentMethod: "cash",
              recordedBy: "Budi Finance",
              paymentDate: "2026-10-14 15:20:00",
              sourceAccount: "Kas Kecil",
              notes: "Pelunasan tunai setelah instalasi selesai",
            },
          ],
        },
      ],
    },
    {
      id: "vnd-008",
      vendorName: "Gudang Sparepart Offset & Digital",
      vendorPhone: "085277889911",
      vendorCategory: "MAINTENANCE",
      totalExpensesCount: 1,
      unpaidExpensesCount: 0,
      totalAmount: 3750000,
      totalPaid: 3750000,
      totalRemaining: 0,
      hasOverdue: false,
      maxDaysOverdue: 0,
      oldestDueDate: getTodayDateStr(),
      expenses: [
        {
          id: "exp-012",
          expenseNumber: "EXP-2026-0079",
          referenceNumber: "NOTA-GSOD-991",
          categoryName: "Sparepart Mesin",
          expenseDate: getTodayDateStr(),
          dueDate: getTodayDateStr(),
          daysOverdue: 0,
          isOverdue: false,
          totalAmount: 3750000,
          amountPaid: 3750000,
          remainingAmount: 0,
          paymentStatus: "PAID",
          notes: "Roller Karet Penarik Kertas Mesin Konica & Wiper Blade UV",
          payments: [
            {
              id: "pay-v-110",
              payableExpenseId: "exp-012",
              amount: 3750000,
              paymentMethod: "transfer",
              recordedBy: "Budi Finance",
              paymentDate: `${getTodayDateStr()} 09:45:00`,
              sourceAccount: "BCA Operasional",
              notes: "Pelunasan nota langsung via m-banking",
            },
          ],
        },
      ],
    },
  ];

  async getVendorPayables(
    params: VendorPayableParams,
  ): Promise<PaginatedResponse<VendorPayableModel>> {
    // Recalculate dynamic values per expense and vendor
    const computedList = this.vendors.map((vendor) => {
      let totalAmount = 0;
      let totalPaid = 0;
      let totalRemaining = 0;
      let unpaidCount = 0;
      let hasOverdue = false;
      let maxDaysOverdue = 0;
      let oldestDueDate = "";

      const updatedExpenses = vendor.expenses.map((exp) => {
        totalAmount += exp.totalAmount;
        totalPaid += exp.amountPaid;
        totalRemaining += exp.remainingAmount;

        if (exp.remainingAmount > 0) {
          unpaidCount++;
          const { days, isOverdue } = calculateDaysOverdue(exp.dueDate);
          if (isOverdue) {
            hasOverdue = true;
            if (days > maxDaysOverdue) maxDaysOverdue = days;
          }
          if (!oldestDueDate || exp.dueDate < oldestDueDate) {
            oldestDueDate = exp.dueDate;
          }
          return {
            ...exp,
            daysOverdue: days,
            isOverdue,
          };
        }

        return exp;
      });

      return {
        ...vendor,
        totalExpensesCount: vendor.expenses.length,
        unpaidExpensesCount: unpaidCount,
        totalAmount,
        totalPaid,
        totalRemaining,
        hasOverdue,
        maxDaysOverdue,
        oldestDueDate: oldestDueDate || vendor.oldestDueDate,
        expenses: updatedExpenses,
      };
    });

    let filtered = computedList.filter((vendor) => {
      if (params.tab === "ACTIVE") {
        return vendor.totalRemaining > 0;
      }
      return vendor.totalRemaining === 0;
    });

    // Search filter
    if (params.search && params.search.trim() !== "") {
      const q = params.search.toLowerCase().trim();
      filtered = filtered.filter((vendor) => {
        const matchName = vendor.vendorName.toLowerCase().includes(q);
        const matchPhone = vendor.vendorPhone.includes(q);
        const matchExpense = vendor.expenses.some(
          (exp) =>
            exp.expenseNumber.toLowerCase().includes(q) ||
            (exp.referenceNumber && exp.referenceNumber.toLowerCase().includes(q)) ||
            exp.categoryName.toLowerCase().includes(q) ||
            (exp.notes && exp.notes.toLowerCase().includes(q)),
        );
        return matchName || matchPhone || matchExpense;
      });
    }

    // Status filter
    if (params.tab === "ACTIVE" && params.status && params.status !== "ALL") {
      if (params.status === "PARTIAL") {
        filtered = filtered.filter((v) => v.totalPaid > 0 && v.totalRemaining > 0);
      } else if (params.status === "UNPAID") {
        filtered = filtered.filter((v) => v.totalPaid === 0);
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

  async getSettledPayables(
    params: SettledPayableParams,
  ): Promise<PaginatedResponse<SettledExpensePayableModel>> {
    const settledList: SettledExpensePayableModel[] = [];

    this.vendors.forEach((vendor) => {
      vendor.expenses.forEach((exp) => {
        if (exp.remainingAmount === 0 && exp.paymentStatus === "PAID") {
          const lastPayment = exp.payments[exp.payments.length - 1];
          const settledDate = lastPayment?.paymentDate || exp.expenseDate;

          const uniqueMethods = Array.from(new Set(exp.payments.map((p) => p.paymentMethod)));
          const paymentMethod =
            uniqueMethods.length > 1
              ? "split"
              : uniqueMethods[0] || "cash";

          settledList.push({
            id: exp.id,
            vendorId: vendor.id,
            vendorName: vendor.vendorName,
            vendorPhone: vendor.vendorPhone,
            vendorCategory: vendor.vendorCategory,
            expenseNumber: exp.expenseNumber,
            referenceNumber: exp.referenceNumber,
            categoryName: exp.categoryName,
            expenseDate: exp.expenseDate,
            settledDate,
            totalAmount: exp.totalAmount,
            amountPaid: exp.amountPaid,
            paymentMethod,
            payments: exp.payments,
            notes: exp.notes,
          });
        }
      });
    });

    let filtered = settledList;

    if (params.search && params.search.trim() !== "") {
      const q = params.search.toLowerCase().trim();
      filtered = filtered.filter(
        (item) =>
          item.expenseNumber.toLowerCase().includes(q) ||
          (item.referenceNumber && item.referenceNumber.toLowerCase().includes(q)) ||
          item.vendorName.toLowerCase().includes(q) ||
          item.vendorPhone.includes(q) ||
          item.categoryName.toLowerCase().includes(q),
      );
    }

    if (params.startDate) {
      filtered = filtered.filter((item) => item.settledDate.split(" ")[0]! >= params.startDate!);
    }
    if (params.endDate) {
      filtered = filtered.filter((item) => item.settledDate.split(" ")[0]! <= params.endDate!);
    }

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

  async getVendorPayableSummary(): Promise<VendorPayableSummaryModel> {
    const activeList = this.vendors.filter((v) => v.totalRemaining > 0);
    const settledList = this.vendors.filter((v) => v.totalRemaining === 0);

    const totalActivePayable = activeList.reduce((acc, v) => acc + v.totalRemaining, 0);

    const totalOverduePayable = activeList
      .filter((v) => v.hasOverdue)
      .reduce((acc, v) => acc + v.totalRemaining, 0);

    const totalSettledPayable = settledList.reduce((acc, v) => acc + v.totalAmount, 0);

    return {
      totalActivePayable,
      totalOverduePayable,
      totalSettledPayable,
      activeVendorCount: activeList.length,
    };
  }

  async payVendorExpense(
    input: PayVendorExpenseInput,
  ): Promise<{ vendor: VendorPayableModel; expense: PayableExpenseItemModel }> {
    const vIndex = this.vendors.findIndex((v) => v.id === input.vendorId);
    if (vIndex === -1) {
      throw new Error(`Data vendor dengan ID ${input.vendorId} tidak ditemukan.`);
    }

    const vendor = this.vendors[vIndex]!;
    const expIndex = vendor.expenses.findIndex((e) => e.id === input.expenseId);
    if (expIndex === -1) {
      throw new Error(`Nota pengeluaran dengan ID ${input.expenseId} tidak ditemukan.`);
    }

    const targetExp = vendor.expenses[expIndex]!;
    const validPayments = input.payments.filter((p) => p.amount > 0);
    const totalToPay = validPayments.reduce((sum, p) => sum + p.amount, 0);

    if (validPayments.length === 0 || totalToPay <= 0) {
      throw new Error("Nominal pembayaran harus lebih besar dari Rp 0.");
    }
    if (totalToPay > targetExp.remainingAmount) {
      throw new Error(
        `Total nominal pembayaran (Rp ${totalToPay.toLocaleString("id-ID")}) melebihi sisa hutang (${targetExp.remainingAmount.toLocaleString("id-ID")}).`,
      );
    }

    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;

    const newPaymentRecords = validPayments.map((p, idx) => ({
      id: `pay-v-${Date.now()}-${idx}`,
      payableExpenseId: targetExp.id,
      amount: p.amount,
      paymentMethod: p.paymentMethod,
      recordedBy: input.recordedBy || "Finance Officer",
      paymentDate: formattedDate,
      sourceAccount: p.sourceAccount || "BCA Operasional",
      notes: input.notes,
    }));

    const newAmountPaid = targetExp.amountPaid + totalToPay;
    const newRemaining = targetExp.totalAmount - newAmountPaid;
    const newStatus = newRemaining === 0 ? "PAID" : "PARTIAL";

    const updatedExpense: PayableExpenseItemModel = {
      ...targetExp,
      amountPaid: newAmountPaid,
      remainingAmount: newRemaining,
      paymentStatus: newStatus,
      isOverdue: newRemaining > 0 && targetExp.isOverdue,
      payments: [...targetExp.payments, ...newPaymentRecords],
    };

    const updatedExpenses = [...vendor.expenses];
    updatedExpenses[expIndex] = updatedExpense;

    let newTotalRemaining = 0;
    let newTotalPaid = 0;
    let newUnpaidCount = 0;
    let newHasOverdue = false;

    updatedExpenses.forEach((exp) => {
      newTotalRemaining += exp.remainingAmount;
      newTotalPaid += exp.amountPaid;
      if (exp.remainingAmount > 0) {
        newUnpaidCount++;
        if (exp.isOverdue) newHasOverdue = true;
      }
    });

    const updatedVendor: VendorPayableModel = {
      ...vendor,
      expenses: updatedExpenses,
      totalPaid: newTotalPaid,
      totalRemaining: newTotalRemaining,
      unpaidExpensesCount: newUnpaidCount,
      hasOverdue: newHasOverdue,
    };

    this.vendors[vIndex] = updatedVendor;

    return {
      vendor: updatedVendor,
      expense: updatedExpense,
    };
  }
}


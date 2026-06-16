export interface ExpenseBillItem {
  id: string;
  description: string;
  amount: number;
  categoryId: string;
  categoryName: string;
  expenseType: "PRODUCTION" | "OPERATIONAL";
  productCategoryName?: string; // Optional field for production cost linkage
}

export interface ExpensePaymentHistory {
  id: string;
  expenseBillId: string;
  paymentDate: string;
  paymentAccount: string;
  amountPaid: number;
  proofOfPayment?: string;
}

export interface ExpenseBill {
  id: string;
  billNumber: string;
  date: string;
  supplierId?: string;
  supplierName: string;
  discount?: number;
  totalAmount: number;
  paidAmount: number;
  paymentStatus: "UNPAID" | "PARTIAL_PAID" | "PAID" | "VOID";
  description?: string;
  items: ExpenseBillItem[];
  payments: ExpensePaymentHistory[];
}

export const MOCK_EXPENSE_BILLS: ExpenseBill[] = [
  {
    id: "bill-1",
    billNumber: "INV/2026/06/001",
    date: "2026-06-15",
    supplierId: "sup-1",
    supplierName: "PT Surya Paperindo",
    totalAmount: 15000000,
    paidAmount: 15000000,
    paymentStatus: "PAID",
    description: "Pembelian Kertas Art Paper & ATK Kantor",
    items: [
      {
        id: "item-1",
        description: "Art Paper 150gr 20 rim",
        amount: 12500000,
        categoryId: "cat-1",
        categoryName: "ART PAPER",
        expenseType: "PRODUCTION",
        productCategoryName: "Brosur & Flyer",
      },
      {
        id: "item-2",
        description: "Kertas HVS A4 & Map Arsip",
        amount: 2500000,
        categoryId: "cat-2",
        categoryName: "ATK KANTOR",
        expenseType: "OPERATIONAL",
      },
    ],
    payments: [
      {
        id: "pay-1",
        expenseBillId: "bill-1",
        paymentDate: "2026-06-15",
        paymentAccount: "Transfer",
        amountPaid: 15000000,
      },
    ],
  },
  {
    id: "bill-2",
    billNumber: "BILL-992",
    date: "2026-06-12",
    supplierName: "Toko Kelontong Berkah",
    totalAmount: 2000000,
    paidAmount: 500000,
    paymentStatus: "PARTIAL_PAID",
    description: "Konsumsi meeting bulanan & alat tulis",
    items: [
      {
        id: "item-3",
        description: "Kopi, Teh & Snack",
        amount: 1000000,
        categoryId: "cat-3",
        categoryName: "KONSUMSI",
        expenseType: "OPERATIONAL",
      },
      {
        id: "item-4",
        description: "Buku Catatan & Pena",
        amount: 1000000,
        categoryId: "cat-2",
        categoryName: "ATK KANTOR",
        expenseType: "OPERATIONAL",
      },
    ],
    payments: [
      {
        id: "pay-2",
        expenseBillId: "bill-2",
        paymentDate: "2026-06-12",
        paymentAccount: "Cash",
        amountPaid: 500000,
      },
    ],
  },
  {
    id: "bill-3",
    billNumber: "INV-SP-002",
    date: "2026-06-10",
    supplierId: "sup-2",
    supplierName: "Indo Printing Supply",
    totalAmount: 8200000,
    paidAmount: 0,
    paymentStatus: "UNPAID",
    description: "Pembelian Tinta Mimaki Eco-Solvent",
    items: [
      {
        id: "item-5",
        description: "Tinta Mimaki Eco-Solvent @4 liter",
        amount: 8200000,
        categoryId: "cat-4",
        categoryName: "TINTA OUTDOOR",
        expenseType: "PRODUCTION",
        productCategoryName: "Banner / MMT",
      },
    ],
    payments: [],
  },
  {
    id: "bill-4",
    billNumber: "INV-VOID-99",
    date: "2026-06-08",
    supplierName: "Jaya Sparepartindo",
    totalAmount: 4300000,
    paidAmount: 0,
    paymentStatus: "VOID",
    description: "Roller head & printhead cleaning kit (salah input)",
    items: [
      {
        id: "item-6",
        description: "Roller head & printhead cleaning kit",
        amount: 4300000,
        categoryId: "cat-5",
        categoryName: "TONER / SPAREPART",
        expenseType: "PRODUCTION",
        productCategoryName: "Merchandise & Acrylic",
      },
    ],
    payments: [],
  },
];


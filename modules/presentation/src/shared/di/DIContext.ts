import { createContext, useContext } from "react";
import type {
  Login,
  Refresh,
  Logout,
} from "@core/auth/applications/usecases/auth.usecase";
import type { GetResellers, CreateReseller, GetResellerById, UpdateReseller, DeleteReseller } from "@core/reseller/applications/usecases/reseller.usecase";
import type { GetCategories, CreateCategory, GetCategoryById, UpdateCategory, AssignSPKCategory, DeleteCategory, ReorderCategory } from "@core/category/applications/usecases/category.usecase";
import type { GetExpenseCategories, CreateExpenseCategory, GetExpenseCategoryById, UpdateExpenseCategory, DeleteExpenseCategory, ReorderExpenseCategory } from "@core/expense-category/applications/usecases/expense-category.usecase";
import type { GetAttributes, CreateAttribute, GetAttributeById, UpdateAttribute, DeleteAttribute } from "@core/attribute/applications/usecases/attribute.usecase";
import type { GetProducts, CreateProduct, GetProductById, UpdateProduct, DeleteProduct, ReorderProduct } from "@core/product/applications/usecases/product.usecase";
import type { SaveDraftOrder, GetOrders, SubmitOrder, PayOrder, RepayOrder, RefundOrder, CancelOrder, GetOrderSpk, GetOrderPayments, UpdateOrderStatus, GetOrderById, UpdateOrder, GetOrderReportWidgets, GetSalesReportWidgets, GetSalesTrend, GetCategorySales, GetPaymentSales, GetProductSales } from "@core/order/applications/usecases/order.usecase";

import type { GetCashFlowReport, GetCashFlowSummary, CreateCashFlowAdjustment, GetCashAccounts } from "@core/cash-flow/applications/usecases/cash-flow.usecase";
import type {
  GetUsers,
  CreateUser,
  UpdateUser,
  ChangeUserPassword,
  DeleteUser,
  GetRoles,
  GetProfile,
} from "@core/user/applications/usecases/user.usecase";
import type { GetSuppliers, CreateSupplier, GetSupplierById, UpdateSupplier, DeleteSupplier, ReorderSupplier } from "@core/supplier/applications/usecases/supplier.usecase";
import type { CreateExpense, GetExpenses, GetExpenseReportWidgets, GetExpenseAnalyticsSummary, PayExpense, GetCategoryExpenses } from "@core/expense/applications/usecases/expense.usecase";
import type { GetCapitalTransactions, CreateCapitalTransaction, DeleteCapitalTransaction } from "@core/capital/applications/usecases/capital.usecase";
import type { GetFundTransfers, CreateFundTransfer, GetFundTransferWidgets } from "@core/fund-transfer/applications/usecases/fund-transfer.usecase";
import type { GetDashboardWidgets, GetWeeklyRevenue } from "@core/dashboard/applications/usecases/dashboard.usecase";
import type { GetProfitLoss, GetProfitLossTrend } from "@core/report";

// ──────────────────────────────────────────────
// Module Use Case Types
// Tambahkan interface baru di sini saat modul bertambah.
// ──────────────────────────────────────────────

export interface ReportUseCases {
  getProfitLossUseCase: GetProfitLoss;
  getProfitLossTrendUseCase: GetProfitLossTrend;
}

export interface DashboardUseCases {
  getDashboardWidgetsUseCase: GetDashboardWidgets;
  getWeeklyRevenueUseCase: GetWeeklyRevenue;
}

export interface FundTransferUseCases {
  getFundTransfersUseCase: GetFundTransfers;
  createFundTransferUseCase: CreateFundTransfer;
  getFundTransferWidgetsUseCase: GetFundTransferWidgets;
}

export interface CapitalUseCases {
  getCapitalTransactionsUseCase: GetCapitalTransactions;
  createCapitalTransactionUseCase: CreateCapitalTransaction;
  deleteCapitalTransactionUseCase: DeleteCapitalTransaction;
}


export interface AuthUseCases {
  loginUseCase: Login;
  refreshUseCase: Refresh;
  logoutUseCase: Logout;
}

export interface GetResellerUseCases {
  getResellersUseCase: GetResellers;
  createResellerUseCase: CreateReseller;
  getResellerByIdUseCase: GetResellerById;
  updateResellerUseCase: UpdateReseller;
  deleteResellerUseCase: DeleteReseller;
}

export interface SupplierUseCases {
  getSuppliersUseCase: GetSuppliers;
  createSupplierUseCase: CreateSupplier;
  getSupplierByIdUseCase: GetSupplierById;
  updateSupplierUseCase: UpdateSupplier;
  deleteSupplierUseCase: DeleteSupplier;
  reorderSupplierUseCase: ReorderSupplier;
}


export interface GetCategoryUseCases {
  getCategoriesUseCase: GetCategories;
  createCategoryUseCase: CreateCategory;
  getCategoryByIdUseCase: GetCategoryById;
  updateCategoryUseCase: UpdateCategory;
  assignSPKCategoryUseCase: AssignSPKCategory;
  deleteCategoryUseCase: DeleteCategory;
  reorderCategoryUseCase: ReorderCategory;
}

export interface ExpenseCategoryUseCases {
  getExpenseCategoriesUseCase: GetExpenseCategories;
  createExpenseCategoryUseCase: CreateExpenseCategory;
  getExpenseCategoryByIdUseCase: GetExpenseCategoryById;
  updateExpenseCategoryUseCase: UpdateExpenseCategory;
  deleteExpenseCategoryUseCase: DeleteExpenseCategory;
  reorderExpenseCategoryUseCase: ReorderExpenseCategory;
}

export interface GetAttributeUseCases {
  getAttributesUseCase: GetAttributes;
  createAttributeUseCase: CreateAttribute;
  getAttributeByIdUseCase: GetAttributeById;
  updateAttributeUseCase: UpdateAttribute;
  deleteAttributeUseCase: DeleteAttribute;
}

export interface GetProductUseCases {
  getProductsUseCase: GetProducts;
  createProductUseCase: CreateProduct;
  getProductByIdUseCase: GetProductById;
  updateProductUseCase: UpdateProduct;
  deleteProductUseCase: DeleteProduct;
  reorderProductUseCase: ReorderProduct;
}

export interface OrderUseCases {
  saveDraftOrderUseCase: SaveDraftOrder;
  getOrdersUseCase: GetOrders;
  submitOrderUseCase: SubmitOrder;
  payOrderUseCase: PayOrder;
  repayOrderUseCase: RepayOrder;
  refundOrderUseCase: RefundOrder;
  cancelOrderUseCase: CancelOrder;
  getOrderSpkUseCase: GetOrderSpk;
  getOrderPaymentsUseCase: GetOrderPayments;
  updateOrderStatusUseCase: UpdateOrderStatus;
  getOrderByIdUseCase: GetOrderById;
  updateOrderUseCase: UpdateOrder;
  getOrderReportWidgetsUseCase: GetOrderReportWidgets;
  getSalesReportWidgetsUseCase: GetSalesReportWidgets;
  getSalesTrendUseCase: GetSalesTrend;
  getCategorySalesUseCase: GetCategorySales;
  getProductSalesUseCase: GetProductSales;
  getPaymentSalesUseCase: GetPaymentSales;
}

export interface CashFlowUseCases {
  getCashFlowReportUseCase: GetCashFlowReport;
  getCashFlowSummaryUseCase: GetCashFlowSummary;
  createCashFlowAdjustmentUseCase: CreateCashFlowAdjustment;
  getCashAccountsUseCase: GetCashAccounts;
}

export interface UserUseCases {
  getUsersUseCase: GetUsers;
  createUserUseCase: CreateUser;
  updateUserUseCase: UpdateUser;
  changeUserPasswordUseCase: ChangeUserPassword;
  deleteUserUseCase: DeleteUser;
  getRolesUseCase: GetRoles;
  getProfileUseCase: GetProfile;
}

export interface ExpenseUseCases {
  createExpenseUseCase: CreateExpense;
  getExpensesUseCase: GetExpenses;
  getExpenseReportWidgetsUseCase: GetExpenseReportWidgets;
  getExpenseAnalyticsSummaryUseCase: GetExpenseAnalyticsSummary;
  payExpenseUseCase: PayExpense;
  getCategoryExpensesUseCase: GetCategoryExpenses;
}


// ──────────────────────────────────────────────
// App Container
// Gabungan seluruh modul. Satu property per modul.
// ──────────────────────────────────────────────

export interface AppContainer {
  auth: AuthUseCases;
  reseller: GetResellerUseCases;
  category: GetCategoryUseCases;
  expenseCategory: ExpenseCategoryUseCases;
  attribute: GetAttributeUseCases;
  product: GetProductUseCases;
  order: OrderUseCases;
  cashFlow: CashFlowUseCases;
  user: UserUseCases;
  supplier: SupplierUseCases;
  expense: ExpenseUseCases;
  capital: CapitalUseCases;
  fundTransfer: FundTransferUseCases;
  dashboard: DashboardUseCases;
  report: ReportUseCases;
}

// ──────────────────────────────────────────────
// React Context (Single)
// ──────────────────────────────────────────────

export const DIContext = createContext<AppContainer | null>(null);

/**
 * useDI
 * Base hook untuk mengakses seluruh container.
 * Biasanya tidak dipanggil langsung — gunakan selector hook per modul.
 */
export const useDI = (): AppContainer => {
  const context = useContext(DIContext);
  if (!context) {
    throw new Error("useDI must be used within DIProvider.");
  }
  return context;
};

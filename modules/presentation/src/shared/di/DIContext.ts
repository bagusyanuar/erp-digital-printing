import { createContext, useContext } from "react";
import type {
  Login,
  Refresh,
  Logout,
} from "@core/auth/applications/usecases/auth.usecase";
import type { GetResellers, CreateReseller, GetResellerById, UpdateReseller, DeleteReseller } from "@core/reseller/applications/usecases/reseller.usecase";
import type { GetCategories, CreateCategory, GetCategoryById, UpdateCategory, DeleteCategory } from "@core/category/applications/usecases/category.usecase";
import type { GetAttributes, CreateAttribute, GetAttributeById, UpdateAttribute, DeleteAttribute } from "@core/attribute/applications/usecases/attribute.usecase";
import type { GetProducts, CreateProduct, GetProductById, UpdateProduct, DeleteProduct } from "@core/product/applications/usecases/product.usecase";
import type { SaveDraftOrder, GetOrders, SubmitOrder, PayOrder, RepayOrder, GetOrderSpk, GetOrderPayments, UpdateOrderStatus, GetOrderById, UpdateOrder } from "@core/order/applications/usecases/order.usecase";
import type { GetCashFlowReport, GetCashFlowSummary, CreateCashFlowAdjustment, GetCashAccounts } from "@core/cash-flow/applications/usecases/cash-flow.usecase";


// ──────────────────────────────────────────────
// Module Use Case Types
// Tambahkan interface baru di sini saat modul bertambah.
// ──────────────────────────────────────────────

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

export interface GetCategoryUseCases {
  getCategoriesUseCase: GetCategories;
  createCategoryUseCase: CreateCategory;
  getCategoryByIdUseCase: GetCategoryById;
  updateCategoryUseCase: UpdateCategory;
  deleteCategoryUseCase: DeleteCategory;
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
}

export interface OrderUseCases {
  saveDraftOrderUseCase: SaveDraftOrder;
  getOrdersUseCase: GetOrders;
  submitOrderUseCase: SubmitOrder;
  payOrderUseCase: PayOrder;
  repayOrderUseCase: RepayOrder;
  getOrderSpkUseCase: GetOrderSpk;
  getOrderPaymentsUseCase: GetOrderPayments;
  updateOrderStatusUseCase: UpdateOrderStatus;
  getOrderByIdUseCase: GetOrderById;
  updateOrderUseCase: UpdateOrder;
}

export interface CashFlowUseCases {
  getCashFlowReportUseCase: GetCashFlowReport;
  getCashFlowSummaryUseCase: GetCashFlowSummary;
  createCashFlowAdjustmentUseCase: CreateCashFlowAdjustment;
  getCashAccountsUseCase: GetCashAccounts;
}


// ──────────────────────────────────────────────
// App Container
// Gabungan seluruh modul. Satu property per modul.
// ──────────────────────────────────────────────

export interface AppContainer {
  auth: AuthUseCases;
  reseller: GetResellerUseCases;
  category: GetCategoryUseCases;
  attribute: GetAttributeUseCases;
  product: GetProductUseCases;
  order: OrderUseCases;
  cashFlow: CashFlowUseCases;
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

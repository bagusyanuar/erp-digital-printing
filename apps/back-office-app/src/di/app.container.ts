import { createHttpClient } from "@infrastructure/libs/http";
import {
  createLoginUseCase,
  createRefreshUseCase,
  createLogoutUseCase,
} from "@infrastructure/auth/containers/auth.container";
import { useAuthStore } from "@presentation/auth/stores/auth.store";
import type { AppContainer } from "@presentation/shared/di/DIContext";
import { getResellerUseCase, createResellerUseCase, getResellerByIdUseCase, updateResellerUseCase, deleteResellerUseCase } from "@infrastructure/reseller/containers/reseller.container";
import { getSupplierUseCase, createSupplierUseCase, getSupplierByIdUseCase, updateSupplierUseCase, deleteSupplierUseCase } from "@infrastructure/supplier/containers/supplier.container";
import { createExpenseUseCase, getExpensesUseCase, getExpenseReportWidgetsUseCase, getExpenseAnalyticsSummaryUseCase, payExpenseUseCase } from "@infrastructure/expense/containers/expense.container";
import { getCapitalTransactionsUseCase, createCapitalTransactionUseCase, deleteCapitalTransactionUseCase } from "@infrastructure/capital/containers/capital.container";
import { getFundTransfersUseCase, createFundTransferUseCase, getFundTransferWidgetsUseCase } from "@infrastructure/fund-transfer/containers/fund-transfer.container";



import { getCategoryUseCase, createCategoryUseCase, getCategoryByIdUseCase, updateCategoryUseCase, deleteCategoryUseCase } from "@infrastructure/category/containers/category.container";
import {
  getExpenseCategoriesUseCase,
  createExpenseCategoryUseCase,
  getExpenseCategoryByIdUseCase,
  updateExpenseCategoryUseCase,
  deleteExpenseCategoryUseCase,
} from "@infrastructure/expense-category/containers/expense-category.container";
import { getAttributeUseCase, createAttributeUseCase, getAttributeByIdUseCase, updateAttributeUseCase, deleteAttributeUseCase } from "@infrastructure/attribute/containers/attribute.container";
import { getProductUseCase, createProductUseCase, getProductByIdUseCase, updateProductUseCase, deleteProductUseCase } from "@infrastructure/product/containers/product.container";
import { saveDraftUseCase, getOrdersUseCase, submitOrderUseCase, payOrderUseCase, repayOrderUseCase, refundOrderUseCase, getOrderPaymentsUseCase, getOrderSpkUseCase, updateOrderStatusUseCase, getOrderByIdUseCase, updateOrderUseCase, getOrderReportWidgetsUseCase } from "@infrastructure/order/containers/order.container";
import { getCashFlowReportUseCase, getCashFlowSummaryUseCase, createCashFlowAdjustmentUseCase, getCashAccountsUseCase } from "@infrastructure/cash-flow/containers/cash-flow.container";
import { getUsersUseCase } from "@infrastructure/user/containers/user.container";

/**
 * createAppContainer
 *
 * Pusat perakitan seluruh dependency aplikasi (Composition Root).
 * Cukup tambahkan property baru saat modul baru dibuat.
 */
export function createAppContainer(): AppContainer {
  const httpClient = createHttpClient(
    () => useAuthStore.getState().accessToken,
    (token) => useAuthStore.getState().setToken(token),
    () => useAuthStore.getState().clearToken(),
  );

  return {
    auth: {
      loginUseCase: createLoginUseCase(httpClient),
      refreshUseCase: createRefreshUseCase(httpClient),
      logoutUseCase: createLogoutUseCase(httpClient),
    },
    reseller: {
      getResellersUseCase: getResellerUseCase(httpClient),
      createResellerUseCase: createResellerUseCase(httpClient),
      getResellerByIdUseCase: getResellerByIdUseCase(httpClient),
      updateResellerUseCase: updateResellerUseCase(httpClient),
      deleteResellerUseCase: deleteResellerUseCase(httpClient),
    },
    category: {
      getCategoriesUseCase: getCategoryUseCase(httpClient),
      createCategoryUseCase: createCategoryUseCase(httpClient),
      getCategoryByIdUseCase: getCategoryByIdUseCase(httpClient),
      updateCategoryUseCase: updateCategoryUseCase(httpClient),
      deleteCategoryUseCase: deleteCategoryUseCase(httpClient),
    },
    expenseCategory: {
      getExpenseCategoriesUseCase: getExpenseCategoriesUseCase(httpClient),
      createExpenseCategoryUseCase: createExpenseCategoryUseCase(httpClient),
      getExpenseCategoryByIdUseCase: getExpenseCategoryByIdUseCase(httpClient),
      updateExpenseCategoryUseCase: updateExpenseCategoryUseCase(httpClient),
      deleteExpenseCategoryUseCase: deleteExpenseCategoryUseCase(httpClient),
    },
    attribute: {
      getAttributesUseCase: getAttributeUseCase(httpClient),
      createAttributeUseCase: createAttributeUseCase(httpClient),
      getAttributeByIdUseCase: getAttributeByIdUseCase(httpClient),
      updateAttributeUseCase: updateAttributeUseCase(httpClient),
      deleteAttributeUseCase: deleteAttributeUseCase(httpClient),
    },
    product: {
      getProductsUseCase: getProductUseCase(httpClient),
      createProductUseCase: createProductUseCase(httpClient),
      getProductByIdUseCase: getProductByIdUseCase(httpClient),
      updateProductUseCase: updateProductUseCase(httpClient),
      deleteProductUseCase: deleteProductUseCase(httpClient),
    },
    order: {
      saveDraftOrderUseCase: saveDraftUseCase(httpClient),
      getOrdersUseCase: getOrdersUseCase(httpClient),
      submitOrderUseCase: submitOrderUseCase(httpClient),
      payOrderUseCase: payOrderUseCase(httpClient),
      repayOrderUseCase: repayOrderUseCase(httpClient),
      refundOrderUseCase: refundOrderUseCase(httpClient),
      getOrderPaymentsUseCase: getOrderPaymentsUseCase(httpClient),
      getOrderSpkUseCase: getOrderSpkUseCase(httpClient),
      updateOrderStatusUseCase: updateOrderStatusUseCase(httpClient),
      getOrderByIdUseCase: getOrderByIdUseCase(httpClient),
      updateOrderUseCase: updateOrderUseCase(httpClient),
      getOrderReportWidgetsUseCase: getOrderReportWidgetsUseCase(httpClient),
    },
    cashFlow: {
      getCashFlowReportUseCase: getCashFlowReportUseCase(httpClient),
      getCashFlowSummaryUseCase: getCashFlowSummaryUseCase(httpClient),
      createCashFlowAdjustmentUseCase: createCashFlowAdjustmentUseCase(httpClient),
      getCashAccountsUseCase: getCashAccountsUseCase(httpClient),
    },
    user: {
      getUsersUseCase: getUsersUseCase(httpClient),
    },
    supplier: {
      getSuppliersUseCase: getSupplierUseCase(httpClient),
      createSupplierUseCase: createSupplierUseCase(httpClient),
      getSupplierByIdUseCase: getSupplierByIdUseCase(httpClient),
      updateSupplierUseCase: updateSupplierUseCase(httpClient),
      deleteSupplierUseCase: deleteSupplierUseCase(httpClient),
    },
    expense: {
      createExpenseUseCase: createExpenseUseCase(httpClient),
      getExpensesUseCase: getExpensesUseCase(httpClient),
      getExpenseReportWidgetsUseCase: getExpenseReportWidgetsUseCase(httpClient),
      getExpenseAnalyticsSummaryUseCase: getExpenseAnalyticsSummaryUseCase(httpClient),
      payExpenseUseCase: payExpenseUseCase(httpClient),
    },
    capital: {
      getCapitalTransactionsUseCase: getCapitalTransactionsUseCase(httpClient),
      createCapitalTransactionUseCase: createCapitalTransactionUseCase(httpClient),
      deleteCapitalTransactionUseCase: deleteCapitalTransactionUseCase(httpClient),
    },
    fundTransfer: {
      getFundTransfersUseCase: getFundTransfersUseCase(httpClient),
      createFundTransferUseCase: createFundTransferUseCase(httpClient),
      getFundTransferWidgetsUseCase: getFundTransferWidgetsUseCase(httpClient),
    },
  };
}

import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import { authRoutes } from "./modules/auth.routes";
import { dashboardRoutes } from "./modules/dashboard.routes";
import { sharedRoutes } from "./modules/shared.routes";
import { categoryRoutes } from "./modules/category.routes";
import { userRoutes } from "./modules/user.routes";
import { productRoutes } from "./modules/product.routes";
import { attributeRoutes } from "./modules/attribute.routes";
import { customerRoutes } from "./modules/customer.routes";
import { resellerRoutes } from "./modules/reseller.routes";
import { supplierRoutes } from "./modules/supplier.routes";
import { jobEntryRoutes } from "./modules/job-entry.routes";
import { orderRoutes } from "./modules/order.routes";
import { invoiceRoutes } from "./modules/invoice.routes";
import { cashFlowRoutes } from "./modules/cash-flow.routes";
import { expenseCategoryRoutes } from "./modules/expense-category.routes";
import { expenseRoutes } from "./modules/expense.routes";
import { capitalInjectionRoutes } from "./modules/capital-injection.routes";
import { capitalWithdrawalRoutes } from "./modules/capital-withdrawal.routes";
import { fundTransferRoutes } from "./modules/fund-transfer.routes";
import { reportRoutes } from "./modules/report.routes";
import { PageLoader } from "../components/PageLoader";
import MainLayout from "../layouts/MainLayout";

import { ProtectedRoute } from "@presentation/shared/guards/ProtectedRoute";
import { PublicRoute } from "@presentation/shared/guards/PublicRoute";
import { RoleGuard } from "@presentation/shared/guards/RoleGuard";

const Root = () => {
  return (
    <>
      <PageLoader />
      <Outlet />
    </>
  );
};

// Main Router Configuration merging all modules
const router = createBrowserRouter([
  {
    element: <Root />,
    children: [
      // Rute Publik (Hanya bisa diakses jika BELUM login)
      {
        element: <PublicRoute />,
        children: [...authRoutes],
      },
      // Rute Terproteksi (Hanya bisa diakses jika SUDAH login)
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <MainLayout />,
            children: [
              // 1. Rute Khusus Administrator & Designer (Tiket Pesanan)
              {
                element: <RoleGuard allowedRoles={["administrator", "designer"]} />,
                children: [...jobEntryRoutes],
              },

              // 2. Rute Administrator & Admin (Dashboard, Pesanan Baru, Invoice, Semua Keuangan, Biro, Supplier, Semua Laporan)
              {
                element: <RoleGuard allowedRoles={["administrator", "admin"]} />,
                children: [
                  ...dashboardRoutes,
                  ...orderRoutes,
                  ...invoiceRoutes,
                  ...expenseRoutes,
                  ...capitalInjectionRoutes,
                  ...capitalWithdrawalRoutes,
                  ...fundTransferRoutes,
                  ...cashFlowRoutes,
                  ...resellerRoutes,
                  ...supplierRoutes,
                  ...reportRoutes,
                ],
              },

              // 3. Rute Khusus Administrator (Master Kategori, Master Produk, Atribut, Pelanggan, User)
              {
                element: <RoleGuard allowedRoles={["administrator"]} />,
                children: [
                  ...categoryRoutes,
                  ...expenseCategoryRoutes,
                  ...productRoutes,
                  ...attributeRoutes,
                  ...customerRoutes,
                  ...userRoutes,
                ],
              },
            ],
          },
        ],
      },
      // Rute Bersama (Bisa diakses siapa saja, misal 404)
      ...sharedRoutes,
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}

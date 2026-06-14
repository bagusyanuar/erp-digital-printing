import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import { authRoutes } from "./modules/auth.routes";
import { dashboardRoutes } from "./modules/dashboard.routes";
import { sharedRoutes } from "./modules/shared.routes";
import { categoryRoutes } from "./modules/category.routes";
import { productRoutes } from "./modules/product.routes";
import { attributeRoutes } from "./modules/attribute.routes";
import { customerRoutes } from "./modules/customer.routes";
import { resellerRoutes } from "./modules/reseller.routes";
import { jobEntryRoutes } from "./modules/job-entry.routes";
import { orderRoutes } from "./modules/order.routes";
import { invoiceRoutes } from "./modules/invoice.routes";
import { cashFlowRoutes } from "./modules/cash-flow.routes";
import { expenseCategoryRoutes } from "./modules/expense-category.routes";
import { PageLoader } from "../components/PageLoader";
import MainLayout from "../layouts/MainLayout";

import { ProtectedRoute } from "@presentation/shared/guards/ProtectedRoute";
import { PublicRoute } from "@presentation/shared/guards/PublicRoute";

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
              ...dashboardRoutes,
              ...categoryRoutes,
              ...expenseCategoryRoutes,
              ...productRoutes,
              ...attributeRoutes,
              ...customerRoutes,
              ...resellerRoutes,
              ...jobEntryRoutes,
              ...orderRoutes,
              ...invoiceRoutes,
              ...cashFlowRoutes,
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

import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import { authRoutes } from "./modules/auth.routes";
import { dashboardRoutes } from "./modules/dashboard.routes";
import { sharedRoutes } from "./modules/shared.routes";
import { categoryRoutes } from "./modules/category.routes";
import { productRoutes } from "./modules/product.routes";
import { PageLoader } from "../components/PageLoader";

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
      ...authRoutes,
      ...dashboardRoutes,
      ...sharedRoutes,
      ...categoryRoutes,
      ...productRoutes,
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}

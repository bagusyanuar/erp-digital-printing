import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { authRoutes } from "./modules/auth.routes";
import { dashboardRoutes } from "./modules/dashboard.routes";
import { sharedRoutes } from "./modules/shared.routes";

// Main Router Configuration merging all modules
const router = createBrowserRouter([
  ...authRoutes,
  ...dashboardRoutes,
  ...sharedRoutes,
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}

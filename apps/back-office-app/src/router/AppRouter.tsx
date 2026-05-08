import { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import brandLogo from "../assets/brand-logo.png";

// Lazy loading pages
const LoginPage = lazy(() => import("@presentation/auth/pages/LoginPage"));
const DashboardPage = lazy(() => import("../pages/DashboardPage"));

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Suspense fallback={<div className="h-screen w-full flex items-center justify-center">Loading Login...</div>}>
        <LoginPage logo={brandLogo} />
      </Suspense>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <Suspense fallback={<div className="h-screen w-full flex items-center justify-center">Loading Dashboard...</div>}>
        <DashboardPage />
      </Suspense>
    ),
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}

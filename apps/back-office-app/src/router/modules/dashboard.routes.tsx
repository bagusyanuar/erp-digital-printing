import { lazy, Suspense } from "react";
import { type RouteObject } from "react-router-dom";

const DashboardPage = lazy(() => import("../../pages/DashboardPage"));

export const dashboardRoutes: RouteObject[] = [
  {
    path: "/dashboard",
    element: (
      <Suspense fallback={<div className="h-screen w-full flex items-center justify-center">Loading Dashboard...</div>}>
        <DashboardPage />
      </Suspense>
    ),
  },
];

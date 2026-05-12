import { lazy, Suspense } from "react";
import { type RouteObject } from "react-router-dom";

const PresentationDashboard = lazy(() => import("@presentation/dashboard/pages/DashboardPage"));

export const dashboardRoutes: RouteObject[] = [
  {
    path: "/dashboard",
    handle: { title: "Dashboard Overview" },
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<div className="h-full w-full flex items-center justify-center font-bold text-muted-foreground">Loading Content...</div>}>
            <PresentationDashboard />
          </Suspense>
        ),
      },
    ],
  },
];

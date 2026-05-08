import { lazy, Suspense } from "react";
import { type RouteObject, Outlet } from "react-router-dom";
import { AppLayout, AppLayoutHeader, AppLayoutContent } from "@erp-digital-printing/ui/Layout";
import { NavSidebar } from "@shell/components/NavSidebar";

const PresentationDashboard = lazy(() => import("@presentation/dashboard/pages/DashboardPage"));

const DashboardLayout = () => {
  return (
    <AppLayout sidebar={<NavSidebar />}>
      <AppLayoutHeader title="Dashboard Overview" />
      <AppLayoutContent className="p-0">
        <Outlet />
      </AppLayoutContent>
    </AppLayout>
  );
};

export const dashboardRoutes: RouteObject[] = [
  {
    path: "/dashboard",
    element: <DashboardLayout />,
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

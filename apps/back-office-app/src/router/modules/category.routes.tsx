import { lazy, Suspense } from "react";
import { type RouteObject, Outlet } from "react-router-dom";
import { AppLayout, AppLayoutHeader, AppLayoutContent } from "@erp-digital-printing/ui/Layout";
import { NavSidebar } from "@shell/components/NavSidebar";

const PresentationCategory = lazy(() => import("@presentation/category/pages/CategoryPage"));

const DashboardLayout = () => {
  return (
    <AppLayout sidebar={<NavSidebar />}>
      <AppLayoutHeader title="Category" />
      <AppLayoutContent className="p-0">
        <Outlet />
      </AppLayoutContent>
    </AppLayout>
  );
};

export const categoryRoutes: RouteObject[] = [
  {
    path: "/category",
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<div className="h-full w-full flex items-center justify-center font-bold text-muted-foreground">Loading Content...</div>}>
            <PresentationCategory />
          </Suspense>
        ),
      },
    ],
  },
];

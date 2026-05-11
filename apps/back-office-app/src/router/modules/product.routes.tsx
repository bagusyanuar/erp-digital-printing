import { lazy, Suspense } from "react";
import { type RouteObject, Outlet } from "react-router-dom";
import {
  AppLayout,
  AppLayoutHeader,
  AppLayoutContent,
} from "@erp-digital-printing/ui/Layout";
import { NavSidebar } from "@shell/components/NavSidebar";

const PresentationProduct = lazy(
  () => import("@presentation/product/pages/ProductPage"),
);

const DashboardLayout = () => {
  return (
    <AppLayout sidebar={<NavSidebar />}>
      <AppLayoutHeader title="Product" />
      <AppLayoutContent className="p-0">
        <Outlet />
      </AppLayoutContent>
    </AppLayout>
  );
};

export const productRoutes: RouteObject[] = [
  {
    path: "/product",
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: (
          <Suspense
            fallback={
              <div className="h-full w-full flex items-center justify-center font-bold text-muted-foreground">
                Loading Content...
              </div>
            }
          >
            <PresentationProduct />
          </Suspense>
        ),
      },
    ],
  },
];

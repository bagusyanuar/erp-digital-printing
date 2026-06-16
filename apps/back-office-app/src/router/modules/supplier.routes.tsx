import React, { lazy, Suspense } from "react";
import { type RouteObject } from "react-router-dom";

const lazySupplierPage = lazy(
  () => import("@presentation/supplier/pages/SupplierPage"),
);

export const supplierRoutes: RouteObject[] = [
  {
    path: "/supplier",
    handle: { title: "Supplier" },
    children: [
      {
        index: true,
        element: (
          <Suspense
            fallback={
              <div className="h-full w-full flex items-center justify-center font-bold text-muted-foreground">
                Loading Supplier...
              </div>
            }
          >
            {React.createElement(lazySupplierPage)}
          </Suspense>
        ),
      },
    ],
  },
];

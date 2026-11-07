import React, { lazy, Suspense } from "react";
import { type RouteObject } from "react-router-dom";

const lazyPayablePage = lazy(
  () => import("@presentation/payable/pages/PayablePage"),
);

export const payableRoutes: RouteObject[] = [
  {
    path: "/payable",
    handle: { title: "Daftar Hutang Pengeluaran" },
    children: [
      {
        index: true,
        element: (
          <Suspense
            fallback={
              <div className="h-full w-full flex items-center justify-center font-bold text-muted-foreground">
                Loading Daftar Hutang Pengeluaran...
              </div>
            }
          >
            {React.createElement(lazyPayablePage)}
          </Suspense>
        ),
      },
    ],
  },
];


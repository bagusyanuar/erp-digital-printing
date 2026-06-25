import React, { lazy, Suspense } from "react";
import { type RouteObject } from "react-router-dom";

const lazyCapitalWithdrawalPage = lazy(
  () => import("@presentation/capital-withdrawal/pages/CapitalWithdrawalPage"),
);

export const capitalWithdrawalRoutes: RouteObject[] = [
  {
    path: "/capital-withdrawal",
    handle: { title: "Penarikan Modal (Prive)" },
    children: [
      {
        index: true,
        element: (
          <Suspense
            fallback={
              <div className="h-full w-full flex items-center justify-center font-bold text-muted-foreground">
                Loading Penarikan Modal...
              </div>
            }
          >
            {React.createElement(lazyCapitalWithdrawalPage)}
          </Suspense>
        ),
      },
    ],
  },
];

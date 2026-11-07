import React, { lazy, Suspense } from "react";
import { type RouteObject } from "react-router-dom";

const lazyReceivablePage = lazy(
  () => import("@presentation/receivable/pages/ReceivablePage"),
);

export const receivableRoutes: RouteObject[] = [
  {
    path: "/receivable",
    handle: { title: "Daftar Piutang Customer" },
    children: [
      {
        index: true,
        element: (
          <Suspense
            fallback={
              <div className="h-full w-full flex items-center justify-center font-bold text-muted-foreground">
                Loading Daftar Piutang Customer...
              </div>
            }
          >
            {React.createElement(lazyReceivablePage)}
          </Suspense>
        ),
      },
    ],
  },
];


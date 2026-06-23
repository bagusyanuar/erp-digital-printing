import React, { lazy, Suspense } from "react";
import { type RouteObject } from "react-router-dom";

const lazyInvoicePage = lazy(
  () => import("@presentation/invoice/pages/InvoicePage"),
);

export const invoiceRoutes: RouteObject[] = [
  {
    path: "/invoice",
    handle: { title: "Invoice" },
    children: [
      {
        index: true,
        element: (
          <Suspense
            fallback={
              <div className="h-full w-full flex items-center justify-center font-bold text-muted-foreground">
                Loading Invoice...
              </div>
            }
          >
            {React.createElement(lazyInvoicePage)}
          </Suspense>
        ),
      },
    ],
  },
];

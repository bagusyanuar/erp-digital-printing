import React, { lazy, Suspense } from "react";
import { type RouteObject } from "react-router-dom";

const lazyOrderPage = lazy(
  () => import("@presentation/order/pages/OrderPage"),
);

export const orderRoutes: RouteObject[] = [
  {
    path: "/order",
    handle: { title: "Order / Kasir" },
    children: [
      {
        index: true,
        element: (
          <Suspense
            fallback={
              <div className="h-full w-full flex items-center justify-center font-bold text-muted-foreground">
                Loading Kasir...
              </div>
            }
          >
            {React.createElement(lazyOrderPage)}
          </Suspense>
        ),
      },
    ],
  },
];

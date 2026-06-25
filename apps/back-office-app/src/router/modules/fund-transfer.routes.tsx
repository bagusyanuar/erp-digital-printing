import React, { lazy, Suspense } from "react";
import { type RouteObject } from "react-router-dom";

const lazyFundTransferPage = lazy(
  () => import("@presentation/fund-transfer/pages/FundTransferPage"),
);

export const fundTransferRoutes: RouteObject[] = [
  {
    path: "/fund-transfer",
    handle: { title: "Pemindahan Dana" },
    children: [
      {
        index: true,
        element: (
          <Suspense
            fallback={
              <div className="h-full w-full flex items-center justify-center font-bold text-muted-foreground">
                Loading Pemindahan Dana...
              </div>
            }
          >
            {React.createElement(lazyFundTransferPage)}
          </Suspense>
        ),
      },
    ],
  },
];

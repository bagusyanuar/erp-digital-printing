import React, { lazy, Suspense } from "react";
import { type RouteObject } from "react-router-dom";

const lazyCashFlowPage = lazy(
  () => import("@presentation/cash-flow/pages/CashFlowPage"),
);

export const cashFlowRoutes: RouteObject[] = [
  {
    path: "/report/cash-flow",
    handle: { title: "Cash Flow" },
    children: [
      {
        index: true,
        element: (
          <Suspense
            fallback={
              <div className="h-full w-full flex items-center justify-center font-bold text-muted-foreground">
                Loading Cash Flow...
              </div>
            }
          >
            {React.createElement(lazyCashFlowPage)}
          </Suspense>
        ),
      },
    ],
  },
];

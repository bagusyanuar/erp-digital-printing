import React, { lazy, Suspense } from "react";
import { type RouteObject } from "react-router-dom";

const lazyExpensePage = lazy(
  () => import("@presentation/expense/pages/ExpensePage"),
);

export const expenseRoutes: RouteObject[] = [
  {
    path: "/expense",
    handle: { title: "Pengeluaran (Expense)" },
    children: [
      {
        index: true,
        element: (
          <Suspense
            fallback={
              <div className="h-full w-full flex items-center justify-center font-bold text-muted-foreground">
                Loading Pengeluaran...
              </div>
            }
          >
            {React.createElement(lazyExpensePage)}
          </Suspense>
        ),
      },
    ],
  },
];

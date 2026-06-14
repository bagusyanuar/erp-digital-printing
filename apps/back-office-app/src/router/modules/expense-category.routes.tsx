import React, { lazy, Suspense } from "react";
import { type RouteObject } from "react-router-dom";

const lazyExpenseCategoryPage = lazy(
  () => import("@presentation/expense-category/pages/ExpenseCategoryPage"),
);

export const expenseCategoryRoutes: RouteObject[] = [
  {
    path: "/expense-category",
    handle: { title: "Kategori Pengeluaran" },
    children: [
      {
        index: true,
        element: (
          <Suspense
            fallback={
              <div className="h-full w-full flex items-center justify-center font-bold text-muted-foreground">
                Loading Kategori Pengeluaran...
              </div>
            }
          >
            {React.createElement(lazyExpenseCategoryPage)}
          </Suspense>
        ),
      },
    ],
  },
];

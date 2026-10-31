import React, { lazy, Suspense } from "react";
import { type RouteObject } from "react-router-dom";

const lazyReportSellingPage = lazy(
  () => import("@presentation/report-selling/pages/ReportSellingPage"),
);

const lazyReportExpensePage = lazy(
  () => import("@presentation/report-expense/pages/ReportExpensePage"),
);

const lazyReportProfitLossPage = lazy(
  () => import("@presentation/report-profit-loss/pages/ReportProfitLossPage"),
);

export const reportRoutes: RouteObject[] = [
  {
    path: "/report/selling",
    handle: { title: "Laporan Penjualan" },
    children: [
      {
        index: true,
        element: (
          <Suspense
            fallback={
              <div className="h-full w-full flex items-center justify-center font-bold text-muted-foreground">
                Loading Laporan Penjualan...
              </div>
            }
          >
            {React.createElement(lazyReportSellingPage)}
          </Suspense>
        ),
      },
    ],
  },
  {
    path: "/report/expense",
    handle: { title: "Laporan Pengeluaran" },
    children: [
      {
        index: true,
        element: (
          <Suspense
            fallback={
              <div className="h-full w-full flex items-center justify-center font-bold text-muted-foreground">
                Loading Laporan Pengeluaran...
              </div>
            }
          >
            {React.createElement(lazyReportExpensePage)}
          </Suspense>
        ),
      },
    ],
  },
  {
    path: "/report/profit-loss",
    handle: { title: "Laporan Laba Rugi" },
    children: [
      {
        index: true,
        element: (
          <Suspense
            fallback={
              <div className="h-full w-full flex items-center justify-center font-bold text-muted-foreground">
                Loading Laporan Laba Rugi...
              </div>
            }
          >
            {React.createElement(lazyReportProfitLossPage)}
          </Suspense>
        ),
      },
    ],
  },
];

import React, { lazy, Suspense } from "react";
import { type RouteObject } from "react-router-dom";

const ResellerPage = lazy(
  () => import("@presentation/reseller/pages/ResellerPage"),
);

export const resellerRoutes: RouteObject[] = [
  {
    path: "/reseller",
    handle: { title: "Biro / Reseller" },
    element: React.createElement(
      Suspense,
      {
        fallback: React.createElement(
          "div",
          { className: "h-full w-full flex items-center justify-center font-bold text-muted-foreground" },
          "Loading Content..."
        )
      },
      React.createElement(ResellerPage)
    ),
  },
];

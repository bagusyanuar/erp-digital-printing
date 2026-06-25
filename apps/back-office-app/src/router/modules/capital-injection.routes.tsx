import React, { lazy, Suspense } from "react";
import { type RouteObject } from "react-router-dom";

const lazyCapitalInjectionPage = lazy(
  () => import("@presentation/capital-injection/pages/CapitalInjectionPage"),
);

export const capitalInjectionRoutes: RouteObject[] = [
  {
    path: "/capital-injection",
    handle: { title: "Setoran Modal" },
    children: [
      {
        index: true,
        element: (
          <Suspense
            fallback={
              <div className="h-full w-full flex items-center justify-center font-bold text-muted-foreground">
                Loading Setoran Modal...
              </div>
            }
          >
            {React.createElement(lazyCapitalInjectionPage)}
          </Suspense>
        ),
      },
    ],
  },
];

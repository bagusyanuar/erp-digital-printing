import React, { lazy, Suspense } from "react";
import { type RouteObject } from "react-router-dom";

const lazyNotFoundPage = lazy(
  () => import("@presentation/shared/pages/NotFoundPage"),
);
const lazyForbiddenPage = lazy(
  () => import("@presentation/shared/pages/ForbiddenPage"),
);

export const sharedRoutes: RouteObject[] = [
  {
    path: "/403",
    element: (
      <Suspense
        fallback={
          <div className="h-screen w-full flex items-center justify-center">
            Loading...
          </div>
        }
      >
        {React.createElement(lazyForbiddenPage)}
      </Suspense>
    ),
  },
  {
    path: "*",
    element: (
      <Suspense
        fallback={
          <div className="h-screen w-full flex items-center justify-center">
            Loading...
          </div>
        }
      >
        {React.createElement(lazyNotFoundPage)}
      </Suspense>
    ),
  },
];


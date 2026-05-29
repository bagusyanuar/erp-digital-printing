import React, { lazy, Suspense } from "react";
import { type RouteObject } from "react-router-dom";

const lazyAttributePage = lazy(
  () => import("@presentation/attribute/pages/AttributePage"),
);

export const attributeRoutes: RouteObject[] = [
  {
    path: "/attribute",
    handle: { title: "Master Atribut" },
    children: [
      {
        index: true,
        element: (
          <Suspense
            fallback={
              <div className="h-full w-full flex items-center justify-center font-bold text-muted-foreground">
                Loading Content...
              </div>
            }
          >
            {React.createElement(lazyAttributePage)}
          </Suspense>
        ),
      },
    ],
  },
];




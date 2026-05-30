import React, { lazy, Suspense } from "react";
import { type RouteObject } from "react-router-dom";

const lazyJobEntryPage = lazy(
  () => import("@presentation/job-entry/pages/JobEntryPage"),
);

export const jobEntryRoutes: RouteObject[] = [
  {
    path: "/job-entry",
    handle: { title: "Job Entry" },
    children: [
      {
        index: true,
        element: (
          <Suspense
            fallback={
              <div className="h-full w-full flex items-center justify-center font-bold text-muted-foreground">
                Loading Job Entry...
              </div>
            }
          >
            {React.createElement(lazyJobEntryPage)}
          </Suspense>
        ),
      },
    ],
  },
];

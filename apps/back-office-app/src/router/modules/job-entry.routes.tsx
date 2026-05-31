import React, { lazy, Suspense } from "react";
import { type RouteObject } from "react-router-dom";

const lazyJobEntryPage = lazy(
  () => import("@presentation/job-entry/pages/JobEntryPage"),
);

const lazyCreateJobEntryPage = lazy(
  () => import("@presentation/job-entry/pages/CreateJobEntryPage"),
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
      {
        path: "create",
        handle: { title: "Tambah Job Entry" },
        element: (
          <Suspense
            fallback={
              <div className="h-full w-full flex items-center justify-center font-bold text-muted-foreground">
                Loading Tambah Job Entry...
              </div>
            }
          >
            {React.createElement(lazyCreateJobEntryPage)}
          </Suspense>
        ),
      },
    ],
  },
];


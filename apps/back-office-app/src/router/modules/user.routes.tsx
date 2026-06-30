import { lazy, Suspense } from "react";
import { type RouteObject } from "react-router-dom";

const PresentationUser = lazy(() => import("@presentation/user/pages/UserPage"));

export const userRoutes: RouteObject[] = [
  {
    path: "/user",
    handle: { title: "Database User" },
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<div className="h-full w-full flex items-center justify-center font-bold text-muted-foreground">Loading Content...</div>}>
            <PresentationUser />
          </Suspense>
        ),
      },
    ],
  },
];

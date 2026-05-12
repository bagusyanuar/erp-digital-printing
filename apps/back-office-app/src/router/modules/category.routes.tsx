import { lazy, Suspense } from "react";
import { type RouteObject } from "react-router-dom";

const PresentationCategory = lazy(() => import("@presentation/category/pages/CategoryPage"));

export const categoryRoutes: RouteObject[] = [
  {
    path: "/category",
    handle: { title: "Category" },
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<div className="h-full w-full flex items-center justify-center font-bold text-muted-foreground">Loading Content...</div>}>
            <PresentationCategory />
          </Suspense>
        ),
      },
    ],
  },
];

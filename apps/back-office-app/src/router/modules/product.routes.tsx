import { lazy, Suspense } from "react";
import { type RouteObject } from "react-router-dom";

const PresentationProduct = lazy(
  () => import("@presentation/product/pages/ProductPage"),
);

export const productRoutes: RouteObject[] = [
  {
    path: "/product",
    handle: { title: "Product" },
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
            <PresentationProduct />
          </Suspense>
        ),
      },
    ],
  },
];

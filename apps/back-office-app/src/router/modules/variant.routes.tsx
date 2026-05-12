import { lazy, Suspense } from "react";
import { type RouteObject } from "react-router-dom";

const VariantList = lazy(
  () => import("@presentation/variant/pages/VariantPage"),
);

const FormVariant = lazy(
  () => import("@presentation/variant/pages/FormVariant"),
);

export const variantRoutes: RouteObject[] = [
  {
    path: "/variant",
    handle: { title: "Master Bahan" },
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
            <VariantList />
          </Suspense>
        ),
      },
      {
        path: "create",
        handle: { title: "Create Variant" },
        element: (
          <Suspense
            fallback={
              <div className="h-full w-full flex items-center justify-center font-bold text-muted-foreground">
                Loading Content...
              </div>
            }
          >
            <FormVariant />
          </Suspense>
        ),
      },
    ],
  },
];

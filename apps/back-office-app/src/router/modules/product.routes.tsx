import { lazy, Suspense } from "react";
import { type RouteObject } from "react-router-dom";
import { RoleGuard } from "@presentation/shared/guards/RoleGuard";

const PresentationProduct = lazy(
  () => import("@presentation/product/pages/ProductPage"),
);

const FormProduct = lazy(
  () => import("@presentation/product/pages/FormProduct"),
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
      {
        element: <RoleGuard allowedRoles={["administrator"]} />,
        children: [
          {
            path: "create",
            handle: { title: "Create Product" },
            element: (
              <Suspense
                fallback={
                  <div className="h-full w-full flex items-center justify-center font-bold text-muted-foreground">
                    Loading Content...
                  </div>
                }
              >
                <FormProduct />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },
];

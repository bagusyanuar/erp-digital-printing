import { lazy, Suspense } from "react";
import { type RouteObject } from "react-router-dom";

const FormAttribute = lazy(
  () => import("@presentation/attribute/pages/FormAttribute"),
);

export const attributeRoutes: RouteObject[] = [
  {
    path: "/attribute",
    handle: { title: "Master Atribut" },
    children: [
      {
        path: "create",
        handle: { title: "Create Attribute" },
        element: (
          <Suspense
            fallback={
              <div className="h-full w-full flex items-center justify-center font-bold text-muted-foreground">
                Loading Content...
              </div>
            }
          >
            <FormAttribute />
          </Suspense>
        ),
      },
      // List route goes here later
    ],
  },
];

import { lazy, Suspense } from "react";
import { type RouteObject } from "react-router-dom";

const FormCustomerLevel = lazy(
  () => import("@presentation/customer/pages/FormCustomerLevel"),
);

export const customerRoutes: RouteObject[] = [
  {
    path: "/customer",
    handle: { title: "Customer" },
    children: [
      {
        path: "level/create",
        handle: { title: "Create Customer Level" },
        element: (
          <Suspense
            fallback={
              <div className="h-full w-full flex items-center justify-center font-bold text-muted-foreground">
                Loading Content...
              </div>
            }
          >
            <FormCustomerLevel />
          </Suspense>
        ),
      },
      // List route goes here later
    ],
  },
];

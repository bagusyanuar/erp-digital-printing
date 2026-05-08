import { lazy, Suspense } from "react";
import { type RouteObject, useNavigate } from "react-router-dom";

const NotFoundPage = lazy(() => import("@presentation/shared/pages/NotFoundPage"));

const NotFoundWrapper = () => {
  const navigate = useNavigate();
  return <NotFoundPage onBackHome={() => navigate("/")} />;
};

export const sharedRoutes: RouteObject[] = [
  {
    path: "*",
    element: (
      <Suspense fallback={<div className="h-screen w-full flex items-center justify-center">Loading...</div>}>
        <NotFoundWrapper />
      </Suspense>
    ),
  },
];

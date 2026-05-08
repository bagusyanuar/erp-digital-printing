import { lazy, Suspense } from "react";
import { type RouteObject } from "react-router-dom";
import brandLogo from "../../assets/brand-logo.png";

const LoginPage = lazy(() => import("@presentation/auth/pages/LoginPage"));

export const authRoutes: RouteObject[] = [
  {
    path: "/",
    element: (
      <Suspense fallback={<div className="h-screen w-full flex items-center justify-center">Loading Login...</div>}>
        <LoginPage logo={brandLogo} />
      </Suspense>
    ),
  },
];

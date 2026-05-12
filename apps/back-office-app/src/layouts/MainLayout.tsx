import * as React from "react";
import { Outlet, useMatches } from "react-router-dom";
import { AppLayout, AppLayoutContent, AppLayoutHeader } from "@erp-digital-printing/ui/Layout";
import { NavSidebar } from "@shell/components/NavSidebar";

export const MainLayout = () => {
  const matches = useMatches();
  
  // Ambil title dari handle route terakhir yang memiliki title
  const currentMatch = [...matches].reverse().find((m) => (m.handle as any)?.title);
  const title = (currentMatch?.handle as any)?.title;

  return (
    <AppLayout sidebar={<NavSidebar />}>
      {title && <AppLayoutHeader title={title} />}
      <AppLayoutContent className={!title ? "p-0" : ""}>
        <Outlet />
      </AppLayoutContent>
    </AppLayout>
  );
};

export default MainLayout;

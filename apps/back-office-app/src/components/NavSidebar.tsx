import { NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarHeader,
  SidebarAppSwitcher,
  SidebarContent,
  SidebarGroup,
  SidebarItem,
  SidebarItemTree,
  SidebarFooter,
} from "@erp-digital-printing/ui/Sidebar";
import {
  LuLayoutDashboard,
  LuPackage,
  LuDatabase,
  LuHistory,
  LuTruck,
  LuFileText,
  LuCreditCard,
  LuSettings,
  LuBox,
  LuPrinter,
  LuUsers,
  LuScissors,
  LuGauge,
  LuBanknote,
  LuSignature,
  LuTags,
  LuBriefcase,
} from "@erp-digital-printing/ui/icons";

export const NavSidebar = () => {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary font-bold">
            <LuBox className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black text-sidebar-foreground tracking-tighter leading-none">
              MADE
            </span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-1">
              Digital Printing ERP
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarAppSwitcher
        currentApp={{
          name: "Digital Printing",
          description: "Production & Sales",
          icon: <LuPrinter className="h-6 w-6" />,
        }}
      />

      <SidebarContent>
        <SidebarGroup>
          <NavLink to="/dashboard" className="contents">
            {({ isActive }) => (
              <SidebarItem
                asChild
                icon={<LuLayoutDashboard />}
                label="Dashboard"
                active={isActive}
              >
                <button />
              </SidebarItem>
            )}
          </NavLink>
          {/* <SidebarItem icon={<LuGauge />} label="Status Antrean" badge="12" /> */}
        </SidebarGroup>

        <SidebarGroup label="Transaksi">
          <NavLink to="/job-entry" className="contents">
            {({ isActive }) => (
              <SidebarItem
                asChild
                icon={<LuFileText />}
                label="Job Entry (Desainer)"
                active={isActive}
              >
                <button />
              </SidebarItem>
            )}
          </NavLink>
          <SidebarItem icon={<LuSignature />} label="Pesanan Baru (SPK)" />
          <SidebarItem icon={<LuBanknote />} label="Invoice & Piutang" />
          <SidebarItem icon={<LuUsers />} label="Database Pelanggan" />
        </SidebarGroup>

        {/* <SidebarGroup label="Produksi">
          <SidebarItemTree icon={<LuPrinter />} label="Work Order">
            <SidebarItem label="Desain & Pre-press" />
            <SidebarItem label="Proses Cetak" />
            <SidebarItem label="Finishing" />
          </SidebarItemTree>
          <SidebarItem icon={<LuScissors />} label="QC & Packing" />
        </SidebarGroup>

        <SidebarGroup label="Inventory">
          <SidebarItemTree icon={<LuPackage />} label="Stok Bahan">
            <SidebarItem label="Kertas & Media" />
            <SidebarItem label="Tinta & Toner" />
            <SidebarItem label="Sparepart Mesin" />
          </SidebarItemTree>
          <SidebarItem icon={<LuTruck />} label="Penerimaan Barang" />
          <SidebarItem icon={<LuHistory />} label="Stok Opname" />
        </SidebarGroup> */}

        <SidebarGroup label="Master Data">
          <NavLink to="/category" className="contents">
            {({ isActive }) => (
              <SidebarItem
                asChild
                icon={<LuTags />}
                label="Kategori Produk"
                active={isActive}
              >
                <button />
              </SidebarItem>
            )}
          </NavLink>
          <NavLink to="/product" className="contents">
            {({ isActive }) => (
              <SidebarItem
                asChild
                icon={<LuDatabase />}
                label="Produk & Jasa"
                active={isActive}
              >
                <button />
              </SidebarItem>
            )}
          </NavLink>
          <NavLink to="/attribute" className="contents">
            {({ isActive }) => (
              <SidebarItem
                asChild
                icon={<LuBox />}
                label="Master Atribut"
                active={isActive}
              >
                <button />
              </SidebarItem>
            )}
          </NavLink>
          <NavLink to="/reseller" className="contents">
            {({ isActive }) => (
              <SidebarItem
                asChild
                icon={<LuBriefcase />}
                label="Biro / Reseller"
                active={isActive}
              >
                <button />
              </SidebarItem>
            )}
          </NavLink>
          <SidebarItem icon={<LuUsers />} label="Database Supplier" />
          <SidebarItem icon={<LuSettings />} label="Konfigurasi Mesin" />
        </SidebarGroup>

        <SidebarGroup label="Laporan">
          <SidebarItem icon={<LuFileText />} label="Laporan Penjualan" />
          <SidebarItem icon={<LuCreditCard />} label="Laporan Laba Rugi" />
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter
        user={{
          name: "Bagus Yanuar",
          role: "Administrator",
        }}
      />
    </Sidebar>
  );
};

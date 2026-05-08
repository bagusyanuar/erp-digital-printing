import { AppLayout, AppLayoutHeader, AppLayoutContent } from "@erp-digital-printing/ui/Layout";
import { NavSidebar } from "../components/NavSidebar";
import { LuArrowDown, LuArrowUp } from "react-icons/lu";

export default function DashboardPage() {
  return (
    <AppLayout sidebar={<NavSidebar />}>
      <AppLayoutHeader title="Dashboard Overview">
        <div className="flex items-center gap-4">
          <button className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
            Support
          </button>
          <button className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 hover:opacity-90 transition-all">
            Generate Report
          </button>
        </div>
      </AppLayoutHeader>
      
      <AppLayoutContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Metric Card {i}</h3>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-card-foreground tracking-tight">1,23{i}</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  {i % 2 === 0 ? <LuArrowDown className="h-4 w-4" /> : <LuArrowUp className="h-4 w-4" />}
                </div>
              </div>
              <div className="mt-4 text-sm font-medium text-muted-foreground">+12.5% since last week</div>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-3xl bg-white/5 border border-white/10 p-12 h-[500px] flex flex-col items-center justify-center border-dashed group hover:border-white/20 transition-colors">
          <div className="h-16 w-16 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500 text-2xl group-hover:text-indigo-400 transition-colors">
            +
          </div>
          <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-4">Main Content Slot</span>
        </div>
      </AppLayoutContent>
    </AppLayout>
  );
}

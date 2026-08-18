import { Sidebar } from "@/components/layout/sidebar";
import { TopNav } from "@/components/layout/topnav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="pih-app-shell min-h-screen bg-background">
      <style>{`
        html[data-pih-theme="new-web"] :where(input, textarea, select, [role="combobox"]) {
          border-width: 2px;
        }
        html[data-pih-theme="new-web"] :where([role="dialog"], .pih-interactive-card, .pih-module-card, .pih-entity-card) {
          border-width: 2px;
        }
        html[data-pih-theme="new-web"] .pih-entity-card:hover {
          box-shadow: 0 18px 50px rgba(0,0,0,.3), 0 0 0 2px rgba(120,250,174,.32), 0 0 30px rgba(120,250,174,.11);
        }
      `}</style>
      <Sidebar />
      <div className="flex min-h-screen flex-col lg:pl-64">
        <TopNav />
        <main className="pih-main flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}

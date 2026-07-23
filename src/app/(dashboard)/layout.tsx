import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // h-screen + overflow-hidden keeps the sidebar fixed; only <main>
    // scrolls, which also makes sticky headers inside pages reliable.
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 overflow-y-auto scroll-smooth p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

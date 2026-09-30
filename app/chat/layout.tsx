import { Sidebar } from "@/components/sidebar";
import { MobileSidebar } from "@/components/mobile-sidebar";

export default function ChatLayout({ children }: LayoutProps<"/chat">) {
  return (
    <div className="flex h-dvh">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r bg-muted/40 md:block">
        <Sidebar />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar with a menu button */}
        <div className="flex items-center border-b p-2 md:hidden">
          <MobileSidebar>
            <Sidebar />
          </MobileSidebar>
          <span className="font-semibold">ChatGPT Clone</span>
        </div>
        {children}
      </div>
    </div>
  );
}

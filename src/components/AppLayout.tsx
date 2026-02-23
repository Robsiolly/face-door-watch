import { AppSidebar } from "@/components/AppSidebar";
import { NotificationCenter } from "@/components/NotificationCenter";
import { ReactNode, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Menu, Shield } from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";

export function AppLayout({ children }: { children: ReactNode }) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Sidebar — visible only on md+ */}
      {!isMobile && <AppSidebar />}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Sticky top header */}
        <header className="h-16 border-b border-border/50 flex items-center justify-between px-4 md:px-6 glass sticky top-0 z-50 shrink-0">

          {/* Mobile: hamburger + logo */}
          <div className="flex items-center gap-3 md:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64 border-none bg-sidebar">
                <AppSidebar onNavItemClick={() => setOpen(false)} isDrawer />
              </SheetContent>
            </Sheet>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Shield className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-sm tracking-tight">OTREBOR</span>
            </div>
          </div>

          {/* Desktop: spacer fills header left side (sidebar handles branding) */}
          <div className="hidden md:flex flex-1" />

          <NotificationCenter />
        </header>

        {/* Scrollable main content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="p-4 sm:p-5 md:p-6 max-w-[1600px] mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

import { AppSidebar } from "@/components/AppSidebar";
import { NotificationCenter } from "@/components/NotificationCenter";
import { ReactNode, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Menu, Shield } from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { BackgroundEffects } from "@/components/BackgroundEffects";

export function AppLayout({ children }: { children: ReactNode }) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-[#050507] text-foreground selection:bg-primary/30 overflow-hidden relative">
      <BackgroundEffects />

      {/* Sidebar — visible only on md+ */}
      {!isMobile && (
        <div className="reveal-scale h-screen sticky top-0 md:block hidden">
          <AppSidebar />
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 h-screen relative overflow-hidden">
        {/* Sticky top header with heavy glassmorphism */}
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-6 md:px-12 bg-black/20 backdrop-blur-xl sticky top-0 z-50 shrink-0">

          {/* Mobile: hamburger + logo */}
          <div className="flex items-center gap-4 md:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl glass-3d">
                  <Menu className="w-5 h-5 text-primary" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-80 border-none bg-black/95 backdrop-blur-2xl">
                <AppSidebar onNavItemClick={() => setOpen(false)} isDrawer />
              </SheetContent>
            </Sheet>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-lg">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <span className="font-black text-xs tracking-[0.2em] uppercase gold-text">OTREBOR</span>
            </div>
          </div>

          {/* Desktop: Navigation indicator */}
          <div className="hidden md:flex flex-1 items-center gap-4">
            <div className="px-5 py-2 rounded-full bg-white/[0.03] border border-white/5 text-[10px] font-black uppercase tracking-[0.3em] text-primary/70 animate-pulse">
              Interface Quântica Ativa • v2.0
            </div>
          </div>

          <div className="flex items-center gap-4">
            <NotificationCenter />
          </div>
        </header>

        {/* Scrollable main content with parallax wrapper */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden pt-4 custom-scrollbar">
          <div className="p-6 sm:p-10 md:p-16 max-w-[1800px] mx-auto w-full reveal-up parallax-layer">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}


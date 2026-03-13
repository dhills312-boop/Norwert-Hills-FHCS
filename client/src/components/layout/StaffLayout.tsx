import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { LayoutGrid, FileText, Settings, LogOut, User, Receipt, Users, Shield, Package, Megaphone, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export function StaffLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { user, isDirector, logout } = useAuth();

  const navItems = [
    { href: "/staff/dashboard", label: "Sessions", icon: LayoutGrid },
    { href: "/staff/builder", label: "Package Builder", icon: FileText },
    { href: "/staff/billing", label: "Billing & Statement", icon: Receipt },
    { href: "/staff/announcements", label: "Announcements", icon: Megaphone },
    { href: "/staff/cremation", label: "Cremation", icon: Flame },
    ...(isDirector ? [
      { href: "/staff/catalog", label: "Service Catalog", icon: Package },
      { href: "/staff/admin/users", label: "User Management", icon: Users },
    ] : []),
  ];

  const handleLogout = async () => {
    await logout();
    setLocation("/staff/login");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row font-sans">
      <aside className="w-full md:w-64 bg-card border-r border-white/5 flex flex-col flex-shrink-0">
        <div className="p-6 border-b border-white/5 flex items-center justify-between md:justify-center">
          <div className="flex items-center gap-2">
             <img src="/assets/logo-crest.png" className="h-8 w-8" />
             <span className="font-serif text-lg tracking-wide text-foreground">Staff Portal</span>
          </div>
        </div>

        <nav className="flex-grow p-4 space-y-2 overflow-x-auto md:overflow-visible flex md:flex-col gap-2 md:gap-0">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-md transition-all whitespace-nowrap",
                (location === item.href || location.startsWith(item.href + "/"))
                  ? "bg-primary/10 text-primary border border-primary/20" 
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5 mt-auto">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-foreground">{user?.name || "Staff"}</span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                {isDirector && <Shield className="h-3 w-3" />}
                {user?.role === "director" ? "Director" : "Staff"}
              </span>
            </div>
          </div>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-destructive" onClick={handleLogout} data-testid="button-sidebar-logout">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      <main className="flex-grow overflow-y-auto h-[calc(100vh-60px)] md:h-screen bg-neutral-950/50">
        {children}
      </main>
    </div>
  );
}

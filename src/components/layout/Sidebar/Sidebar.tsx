import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  LogOut,
  Users,
  Phone,
  BarChart3,
  LayoutDashboard,
  ClipboardList,
  Eye,
  Menu,
  X,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { Brand } from "@/components/shared/Brand";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const navigationItems: NavItem[] = [
  { label: "Partners", href: "/partners", icon: Users },
  { label: "Taken", href: "/tasks", icon: ClipboardList },
  { label: "Calls", href: "/calls", icon: Phone },
  { label: "Scorecard", href: "/scorecard", icon: BarChart3 },
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
];

export interface SidebarProps {
  className?: string;
  onLogout?: () => void;
}

export const Sidebar = ({ className, onLogout }: SidebarProps) => {
  const [location] = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user, viewAs, setViewAs } = useAuth();

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location]);

  const isActiveRoute = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  const handleLogout = () => {
    document.cookie =
      "session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT";
    window.location.href = "/";
    onLogout?.();
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800",
        "bg-white dark:bg-dark-foreground shadow-sm",
        className,
      )}
    >
      {/* Main nav bar */}
      <div className="flex items-center h-14 px-4 gap-4">
        {/* Brand */}
        <Link href="/partners" className="shrink-0">
          <Brand className="h-7 w-auto" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 flex-1 ml-4">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActiveRoute(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100",
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop right section */}
        <div className="hidden md:flex items-center gap-2 ml-auto">
          {/* Admin "View as" selector */}
          {user?.role === "admin" && user.ams && (
            <div className="flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5 text-gray-400" />
              <select
                value={viewAs || ""}
                onChange={(e) => {
                  setViewAs(e.target.value || null);
                  window.location.reload();
                }}
                className="text-xs bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-2 py-1"
              >
                <option value="">Alle partners</option>
                {user.ams.map((am) => (
                  <option key={am.value} value={am.value}>
                    {am.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <ThemeToggle expanded={false} />
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            title="Logout"
            aria-label="Logout"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>

        {/* Mobile hamburger */}
        <div className="flex md:hidden items-center gap-2 ml-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            aria-label={isMobileOpen ? "Close navigation" : "Open navigation"}
          >
            {isMobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {isMobileOpen && (
        <>
          <div
            className="fixed inset-0 top-14 bg-black/30 z-40 md:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="absolute left-0 right-0 top-14 z-50 md:hidden bg-white dark:bg-dark-foreground border-b border-gray-200 dark:border-gray-800 shadow-lg">
            <nav className="p-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = isActiveRoute(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-gray-200 dark:border-gray-800 p-3 flex items-center justify-between">
              {user?.role === "admin" && user.ams && (
                <div className="flex items-center gap-1.5 flex-1 mr-3">
                  <Eye className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                  <select
                    value={viewAs || ""}
                    onChange={(e) => {
                      setViewAs(e.target.value || null);
                      window.location.reload();
                    }}
                    className="flex-1 text-xs bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-2 py-1.5"
                  >
                    <option value="">Alle partners</option>
                    {user.ams.map((am) => (
                      <option key={am.value} value={am.value}>
                        {am.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex items-center gap-2">
                <ThemeToggle expanded={false} />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  title="Logout"
                  aria-label="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
};

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  PanelLeft,
  PanelLeftClose,
  LogOut,
  Home,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { Badge } from "@/components/ui/Badge";
import { Brand } from "@/components/shared/Brand";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

// Add your navigation items here
const navigationItems: NavItem[] = [{ label: "Home", href: "/", icon: Home }];

const sidebarVariants = {
  expanded: {
    width: 256,
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as const },
  },
  collapsed: {
    width: 64,
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as const },
  },
};

const navTextVariants = {
  expanded: {
    opacity: 1,
    width: "auto",
    transition: { duration: 0.2, delay: 0.1 },
  },
  collapsed: {
    opacity: 0,
    width: 0,
    transition: { duration: 0.15 },
  },
};

const backdropVariants = {
  open: { opacity: 1, transition: { duration: 0.2 } },
  closed: { opacity: 0, transition: { duration: 0.2 } },
};

const mobileDrawerVariants = {
  open: {
    x: 0,
    transition: { type: "spring" as const, damping: 25, stiffness: 200 },
  },
  closed: {
    x: "-100%",
    transition: { type: "spring" as const, damping: 25, stiffness: 200 },
  },
};

const staggerContainerVariants = {
  animate: {
    transition: { staggerChildren: 0.05 },
  },
};

const staggerItemVariants = {
  initial: { opacity: 0, x: -20 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3 },
  },
};

export interface SidebarProps {
  className?: string;
  onLogout?: () => void;
}

export const Sidebar = ({ className, onLogout }: SidebarProps) => {
  const [location] = useLocation();
  const [isExpanded, setIsExpanded] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("sidebar-expanded");
      return stored ? JSON.parse(stored) : true;
    }
    return true;
  });
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("sidebar-expanded", JSON.stringify(isExpanded));
    }
  }, [isExpanded]);

  useEffect(() => {
    if (isMobile) {
      setIsMobileOpen(false);
    }
  }, [location, isMobile]);

  const handleToggle = () => {
    if (isMobile) {
      setIsMobileOpen(!isMobileOpen);
    } else {
      setIsExpanded(!isExpanded);
    }
  };

  const isActiveRoute = (href: string) => {
    if (href === "/") {
      return location === "/";
    }
    return location.startsWith(href);
  };

  const handleLogout = () => {
    document.cookie = "session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT";
    window.location.href = "/";
    onLogout?.();
  };

  if (isMobile) {
    return (
      <>
        <header className="fixed top-0 left-0 right-0 z-30 h-14 bg-white dark:bg-dark-foreground border-b border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="h-full flex items-center px-4 gap-3">
            <Button
              size="icon"
              variant="ghost"
              onClick={handleToggle}
              aria-label="Open navigation"
            >
              <PanelLeft className="h-5 w-5" />
            </Button>
            <Brand className="h-6 w-auto" />
          </div>
        </header>

        <AnimatePresence>
          {isMobileOpen && (
            <motion.div
              variants={backdropVariants}
              initial="closed"
              animate="open"
              exit="closed"
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-black/50 z-40"
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isMobileOpen && (
            <motion.aside
              variants={mobileDrawerVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className={cn(
                "fixed left-0 top-0 bottom-0 z-50 w-64",
                "bg-white dark:bg-dark-foreground border-r border-gray-200 dark:border-gray-800 shadow-xl",
                "flex flex-col",
                className,
              )}
            >
              <SidebarContent
                isExpanded={true}
                isActiveRoute={isActiveRoute}
                onToggle={handleToggle}
                onLogout={handleLogout}
                isMobile={true}
              />
            </motion.aside>
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <motion.aside
      variants={sidebarVariants}
      initial={false}
      animate={isExpanded ? "expanded" : "collapsed"}
      className={cn(
        "relative h-screen border-r border-gray-200 dark:border-gray-800",
        "bg-white dark:bg-dark-foreground",
        "flex flex-col overflow-hidden z-50",
        className,
      )}
    >
      <SidebarContent
        isExpanded={isExpanded}
        isActiveRoute={isActiveRoute}
        onToggle={handleToggle}
        onLogout={handleLogout}
        isMobile={false}
      />
    </motion.aside>
  );
};

interface SidebarContentProps {
  isExpanded: boolean;
  isActiveRoute: (href: string) => boolean;
  onToggle: () => void;
  onLogout: () => void;
  isMobile: boolean;
}

const SidebarContent = ({
  isExpanded,
  isActiveRoute,
  onToggle,
  onLogout,
  isMobile,
}: SidebarContentProps) => {
  const environment = import.meta.env.ENV;

  return (
    <>
      <div className="h-16 flex items-center border-b border-gray-200 dark:border-gray-800 px-3 relative">
        {!isMobile && !isExpanded ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="mx-auto"
            aria-label="Expand sidebar"
          >
            <PanelLeft className="h-5 w-5" />
          </Button>
        ) : (
          <>
            <motion.div
              variants={navTextVariants}
              animate={isExpanded ? "expanded" : "collapsed"}
              className="flex-1 overflow-hidden"
            >
              <Brand className="h-8 w-auto" />
            </motion.div>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={onToggle}
                    className="shrink-0"
                    aria-label={
                      isMobile ? "Close navigation" : "Collapse sidebar"
                    }
                  >
                    <PanelLeftClose className="h-4 w-4" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>

      <motion.nav
        variants={staggerContainerVariants}
        initial="initial"
        animate="animate"
        className="flex-1 overflow-y-auto py-4"
      >
        <ul className="space-y-1 px-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActiveRoute(item.href);
            return (
              <motion.li key={item.href} variants={staggerItemVariants}>
                <Button
                  className={cn(
                    "w-full p-0",
                    isExpanded ? "justify-start" : "justify-center",
                  )}
                  variant="ghost"
                >
                  <Link
                    href={item.href}
                    className={cn(
                      "w-full flex items-center rounded-lg relative",
                      "transition-all duration-200",
                      "hover:bg-gray-100 dark:hover:bg-gray-800",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                      isActive && [
                        "bg-primary/10 dark:bg-primary/20 text-primary font-medium",
                        "before:absolute before:left-0 before:top-1 before:bottom-1 before:w-1 before:bg-primary before:rounded-r",
                      ],
                      isExpanded ? "gap-3 px-3 py-2" : "justify-center p-2",
                    )}
                    aria-current={isActive ? "page" : undefined}
                    title={!isExpanded ? item.label : undefined}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <motion.span
                      variants={navTextVariants}
                      animate={isExpanded ? "expanded" : "collapsed"}
                      className="overflow-hidden whitespace-nowrap text-sm font-medium"
                    >
                      {item.label}
                    </motion.span>
                  </Link>
                </Button>
              </motion.li>
            );
          })}
        </ul>
      </motion.nav>

      <div className="border-t border-gray-200 dark:border-gray-800 p-4 space-y-3">
        {isExpanded ? (
          <div className="flex items-center justify-between">
            <ThemeToggle expanded={true} />
            <Button
              variant="ghost"
              size="icon"
              onClick={onLogout}
              title="Logout"
              aria-label="Logout"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <ThemeToggle expanded={false} />
            <Button
              variant="ghost"
              size="icon"
              onClick={onLogout}
              title="Logout"
              aria-label="Logout"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}

        {isExpanded && environment && (
          <motion.div
            variants={navTextVariants}
            animate="expanded"
            className="flex justify-center"
          >
            <Badge variant="outline" className="text-xs">
              {environment}
            </Badge>
          </motion.div>
        )}
      </div>
    </>
  );
};

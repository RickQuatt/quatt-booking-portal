import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/Switch";

export interface ThemeToggleProps {
  className?: string;
  expanded?: boolean;
}

/**
 * Dark mode toggle using shadcn Switch component
 *
 * @example
 * ```tsx
 * <ThemeToggle />
 * ```
 */
export const ThemeToggle = ({ className, expanded }: ThemeToggleProps) => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {expanded && <Sun className="h-4 w-4 text-muted-foreground" />}
      <Switch
        title="Toggle dark mode"
        checked={isDark}
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
        aria-label="Toggle dark mode"
      />
      {expanded && <Moon className="h-4 w-4 text-muted-foreground" />}
    </div>
  );
};

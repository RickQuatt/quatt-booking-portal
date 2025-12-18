import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";

type Theme = "light" | "dark" | "system";

// Shared state for theme across all hook instances
let listeners: Array<() => void> = [];
let currentTheme: Theme = (() => {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("theme") as Theme | null;
    return stored || "system";
  }
  return "system";
})();

function subscribe(listener: () => void) {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function getSnapshot() {
  return currentTheme;
}

function setTheme(newTheme: Theme) {
  currentTheme = newTheme;
  localStorage.setItem("theme", newTheme);

  // Apply to DOM
  const root = window.document.documentElement;
  root.classList.remove("light", "dark");

  if (newTheme === "system") {
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
      .matches
      ? "dark"
      : "light";
    root.classList.add(systemTheme);
  } else {
    root.classList.add(newTheme);
  }

  // Notify all listeners
  listeners.forEach((listener) => listener());
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  // Track system preference changes for "system" theme
  const [systemPrefersDark, setSystemPrefersDark] = useState(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemPrefersDark(e.matches);
      // Re-apply theme if using system preference
      if (currentTheme === "system") {
        const root = window.document.documentElement;
        root.classList.remove("light", "dark");
        root.classList.add(e.matches ? "dark" : "light");
        listeners.forEach((listener) => listener());
      }
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Apply theme on mount
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "system") {
      root.classList.add(systemPrefersDark ? "dark" : "light");
    } else {
      root.classList.add(theme);
    }
  }, []);

  // Resolve the actual dark mode state
  const isDark = useMemo(() => {
    if (theme === "system") {
      return systemPrefersDark;
    }
    return theme === "dark";
  }, [theme, systemPrefersDark]);

  const setThemeCallback = useCallback((newTheme: Theme) => {
    setTheme(newTheme);
  }, []);

  return { theme, setTheme: setThemeCallback, isDark };
}

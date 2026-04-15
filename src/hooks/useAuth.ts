import { useState, useEffect, useCallback } from "react";

interface AmOption {
  name: string;
  value: string;
}

interface AuthUser {
  email: string;
  name: string;
  role: "admin" | "am";
  assignedAmValue: string | null;
  hasAircall: boolean;
  ams?: AmOption[];
}

// Global viewAs state so all API calls pick it up
let _viewAs: string | null = null;
const _listeners = new Set<() => void>();

export function getViewAs(): string | null {
  return _viewAs;
}

/** Append ?viewAs= to any fetch URL (if set) */
export function apiFetch(url: string, init?: RequestInit): Promise<Response> {
  if (_viewAs) {
    const sep = url.includes("?") ? "&" : "?";
    url = `${url}${sep}viewAs=${_viewAs}`;
  }
  return fetch(url, init);
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewAs, setViewAsState] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  // Subscribe to global viewAs changes
  useEffect(() => {
    const listener = () => setViewAsState(_viewAs);
    _listeners.add(listener);
    return () => { _listeners.delete(listener); };
  }, []);

  const setViewAs = useCallback((value: string | null) => {
    _viewAs = value;
    _listeners.forEach((l) => l());
  }, []);

  return { user, loading, viewAs, setViewAs };
}

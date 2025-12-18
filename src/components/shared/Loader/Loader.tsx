import { useState, useEffect } from "react";

const LOADER_SHOW_DELAY = 500;

export function Loader() {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldShow(true);
    }, LOADER_SHOW_DELAY);
    return () => clearTimeout(timer);
  }, []);

  if (!shouldShow) return null;

  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
    </div>
  );
}

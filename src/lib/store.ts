import { useEffect, useState } from "react";

/** useState persisted to localStorage (client-only; falls back to seed during SSR). */
export function usePersistent<T>(key: string, seed: T) {
  const [value, setValue] = useState<T>(seed);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("fa:" + key);
      if (raw != null) setValue(JSON.parse(raw) as T);
    } catch { /* ignore */ }
    setHydrated(true);
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem("fa:" + key, JSON.stringify(value)); } catch { /* ignore */ }
  }, [key, value, hydrated]);

  return [value, setValue] as const;
}

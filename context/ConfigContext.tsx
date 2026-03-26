"use client";

import { createContext, useContext, useState, useEffect } from "react";
import useSWR from "swr";
import type { StoreConfigType } from "@/types/StoreConfig";

const CACHE_KEY = "storeConfig";

interface CachedConfig {
  data: StoreConfigType;
}

function readCache(): CachedConfig | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeCache(data: StoreConfigType) {
  const entry: CachedConfig = { data };
  localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
}

export function clearConfigCache() {
  localStorage.removeItem(CACHE_KEY);
}

const fetcher = (url: string): Promise<StoreConfigType> =>
  fetch(url).then((res) => res.json());

// null = not yet ready (server render or waiting for first fetch)
const ConfigContext = createContext<StoreConfigType | null>(null);
const ConfigReadyContext = createContext<boolean>(false);

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  const [initialCache] = useState<CachedConfig | null>(() => {
    if (typeof window === "undefined") return null;
    return readCache();
  });

  // Always fetch — SWR's dedupingInterval handles the TTL so we don't
  // re-request within 5 minutes, but the key is never null so mutate()
  // can always trigger a forced revalidation (e.g. after a dashboard save).
  const { data } = useSWR<StoreConfigType>("/api/config", fetcher, {
    // Show cached localStorage data instantly while the first fetch is in-flight
    fallbackData: initialCache?.data,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    // SWR won't re-fetch within this window — replaces the manual TTL check
    dedupingInterval: 5 * 60 * 1000,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Keep localStorage in sync whenever SWR resolves fresh data
  useEffect(() => {
    if (data) {
      writeCache(data);
    }
  }, [data]);

  // Before mount: null (server + first client render — consistent, no hydration mismatch)
  // After mount: real config from SWR (backed by localStorage fallback on cold start)
  const activeConfig = mounted ? (data ?? initialCache?.data ?? null) : null;

  // true only once mounted and real config is in hand
  const configReady = mounted && activeConfig !== null;

  return (
    <ConfigReadyContext.Provider value={configReady}>
      <ConfigContext.Provider value={activeConfig}>
        {children}
        {/* Loading overlay — only shown on cold start (no cache, waiting for first fetch) */}
        {mounted && !activeConfig && (
<div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-[9999]">
  <div className="w-48 h-px bg-shopici-black/10 relative overflow-hidden">
    {/* The Scanner Beam */}
    <div className="absolute inset-0 bg-shopici-black w-24 animate-[scan_1.5s_infinite_ease-in-out]" />
  </div>
  
  {/* Minimalist Text */}
  <span className="mt-4 text-[10px] font-black uppercase tracking-[0.5em] text-shopici-black">
    Chargement
  </span>

  {/* CSS for the scan animation - Add to your global CSS or Tailwind config */}
  <style jsx>{`
    @keyframes scan {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(200%); }
    }
  `}</style>
</div>
        )}
      </ConfigContext.Provider>
    </ConfigReadyContext.Provider>
  );
}

// Returns null until config is ready — gate usage with useConfigReady or null-check
export const useConfig = () => useContext(ConfigContext);

// Returns true only after mount + real config is available
export const useConfigReady = () => useContext(ConfigReadyContext);
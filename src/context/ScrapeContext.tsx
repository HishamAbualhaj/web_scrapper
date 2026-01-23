"use client";

import { createContext, useContext, useState } from "react";
import useScrapeProducts from "@/hooks/useScrapeProducts";
import { SSEEvent } from "@/types/server";

interface ScrapeContextValue {
  startScraping: (storeUrl: string, storeName: string) => Promise<void>;
  progress: SSEEvent | null;
  isScraping: boolean;
  error: string;

  isVisible: boolean;
  hide: () => void;
  show: () => void;
}

const ScrapeContext = createContext<ScrapeContextValue | null>(null);

export function ScrapeProvider({ children }: { children: React.ReactNode }) {
  const scrape = useScrapeProducts();

  const [isVisible, setIsVisible] = useState(true);

  return (
    <ScrapeContext.Provider
      value={{
        ...scrape,
        isVisible,
        hide: () => setIsVisible(false),
        show: () => setIsVisible(true),
      }}
    >
      {children}
    </ScrapeContext.Provider>
  );
}

export function useScrape() {
  const ctx = useContext(ScrapeContext);
  if (!ctx) {
    throw new Error("useScrape must be used inside ScrapeProvider");
  }
  return ctx;
}

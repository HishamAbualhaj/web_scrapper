"use client";

import { useCallback, useEffect, useState } from "react";
import { SSEEvent } from "@/types/server";

interface UseScrapeProductsReturn {
  error: string;
  progress: SSEEvent | null;
  isScraping: boolean;
  startScraping: (storeUrl: string, storeName: string) => Promise<void>;
}

const useScrapeProducts = (): UseScrapeProductsReturn => {
  const [error, setError] = useState("");
  const [progress, setProgress] = useState<SSEEvent | null>(null);
  const [isScraping, setIsScraping] = useState(false);


  const startScraping = useCallback(
    async (storeUrl: string, storeName: string) => {
      if (!storeUrl.trim()) {
        setError("Store URL is required");
        return;
      }

      setError("");
      setProgress(null);
      setIsScraping(true);

      try {
        const response = await fetch("/api/scrapeData", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            storeUrl: storeUrl.trim(),
            storeName: storeName.trim() || undefined,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || `HTTP error! status: ${response.status}`
          );
        }

        if (!response.body) {
          throw new Error("Response body is not available");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.trim()) continue;

            try {
              const event = JSON.parse(line.replace("data:", "").trim());

              if (event.type === "progress") {
                setProgress({
                  type: "progress",
                  current: event.current || 0,
                  msgT: event.msgT,
                  total: event.total || 0,
                  percentage: event.percentage || 0,
                  message: event.message,
                });
              }

              if (event.type === "complete") {
                setProgress({
                  type: "complete",
                  current: event.total || event.current,
                  msgT: event.msgT,
                  total: event.total || event.current,
                  percentage: 100,
                  message: event.message,
                });
              }

              if (event.type === "error") {
                setProgress({
                  type: "error",
                  current: event.total || event.current,
                  msgT: event.msgT,
                  total: event.total || event.current,
                  percentage: 100,
                  message: event.message,
                });
                setError(event.message);
              }
            } catch (parseError) {
              console.error("Error parsing SSE message:", parseError);
              setError("Error parsing server message");
            }
          }
        }
        setIsScraping(false);
      } catch (err: any) {
        console.error("Scraping error:", err);
        setError(err.message || "Failed to scrape products");
      }
    },
    []
  );

  return {
    error,
    progress,
    isScraping,
    startScraping,
  };
};

export default useScrapeProducts;

"use client";

import { useScrape } from "@/context/ScrapeContext";
import ScrapeProgressCard from "@/components/scrape/ScrapeProgressCard";
import ScrapeFloatingButton from "@/components/scrape/ScrapeFloatingButton";
import { useLocale } from "next-intl";
import { useEffect, useState } from "react";

export default function ScrapeProgressUI() {
  const [messages, setMessages] = useState<
    {
      status: "loading" | "completed" | "error";
      msg: string;
      dataT: Record<string, any>;
    }[]
  >([]);
  const { progress, isScraping, isVisible, hide, show, error } = useScrape();

  const locale = useLocale();

  useEffect(() => {
    if (error) {
      // If there's an error, add as error message
      setMessages((prev) => [
        ...prev.map((m) =>
          m.status === "loading" ? { ...m, status: "completed" as const } : m
        ),
        { status: "error", msg: progress?.msgT || error, dataT: {} },
      ]);
      return;
    }
    if (progress) {
      setMessages((prev) => {
        if (progress.type === "complete") {
          return prev
            .map((m) =>
              m.status === "loading"
                ? { ...m, status: "completed" as const }
                : m
            )
            .concat({
              status: "completed",
              msg: progress.msgT,
              dataT: progress.data || {},
            });
        }

        // 1️⃣ Mark all previous loading messages as completed
        const updated = prev.map((m) =>
          m.status === "loading" ? { ...m, status: "completed" as const } : m
        );

        // 2️⃣ Special handling for completion_status
        if (progress.msgT === "completion_status") {
          const lastIndex = updated.findLastIndex(
            (m) => m.msg === "completion_status"
          );

          // Update existing completion_status message
          if (lastIndex !== -1) {
            const copy = [...updated];
            copy[lastIndex] = {
              ...copy[lastIndex],
              status: "loading",
              dataT: {
                total: progress.total,
                current: progress.current,
              },
            };
            return copy;
          }

          // Add it once if it doesn't exist
          return [
            ...updated,
            {
              status: "loading",
              msg: "completion_status",
              dataT: {
                total: progress.total,
                current: progress.current,
              },
            },
          ];
        }

        // 3️⃣ Default behavior (new log entry)
        return [
          ...updated,
          {
            status: progress.type === "error" ? "error" : "loading",
            msg: progress.msgT || progress.message,
            dataT: {
              total: progress.total,
              current: progress.current,
            },
          },
        ];
      });
    }
  }, [progress, error]);

  if (!isScraping && !progress) return null;
  return (
    <>
      <ScrapeProgressCard
        logs={progress ? messages : []}
        progress={progress?.percentage || 0}
        isVisible={isVisible}
        onHide={hide}
        dir={locale === "ar" ? "rtl" : "ltr"}
      />

      <ScrapeFloatingButton
        isVisible={!isVisible}
        onShow={show}
        dir={locale === "ar" ? "rtl" : "ltr"}
      />
    </>
  );
}

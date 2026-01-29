"use client";

import { Button } from "@/components/ui/button";
import { Activity } from "lucide-react";
import { useTranslations } from "next-intl";

interface Props {
  isVisible: boolean;
  onShow: () => void;
  dir?: "rtl" | "ltr";
}

export default function ScrapeFloatingButton({
  isVisible,
  onShow,
  dir = "ltr",
}: Props) {
  const positionClass =
    dir === "rtl" ? "fixed bottom-10 left-6" : "fixed bottom-10 right-6";
  const t = useTranslations("scraping");
  return (
    <Button
      onClick={onShow}
      className={`${positionClass} z-50 shadow-lg rounded-full px-4 py-2
        transition-all duration-300 ease-in-out
        ${
          isVisible
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-90 pointer-events-none"
        }`}
    >
      <Activity className="h-4 w-4 mr-2" />
      {t("showlogs")}
    </Button>
  );
}

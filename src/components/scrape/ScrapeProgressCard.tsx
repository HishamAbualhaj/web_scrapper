"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Check, Loader2, ShieldAlert, X } from "lucide-react";
import { useTranslations } from "next-intl";

interface Props {
  logs: {
    status: "loading" | "completed" | "error";
    msg: string;
    dataT: Record<string, any>;
  }[];
  progress: number;
  isVisible: boolean;
  onHide: () => void;
  dir?: "rtl" | "ltr";
}

export default function ScrapeProgressCard({
  logs,
  progress,
  isVisible,
  onHide,
  dir = "ltr",
}: Props) {
  const positionClass =
    dir === "rtl" ? "fixed bottom-4 left-4" : "fixed bottom-4 right-4";

  const t = useTranslations("scraping");
  return (
    <Card
      className={`${positionClass} w-90 z-50 shadow-xl
        transition-all duration-300 ease-in-out rounded-sm py-3
        ${
          isVisible
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-4 pointer-events-none"
        }`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg font-medium">{t("title")}</CardTitle>

        <Button
          variant="ghost"
          size="icon"
          onClick={onHide}
          className="h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent className="space-y-3 px-3">
        <Progress value={progress} />

        <div className="text-xs text-muted-foreground">
          {progress}% {t("completed")}
        </div>

        <div className="max-h-80 overflow-auto rounded bg-muted p-3.5 text-sm font-mono space-y-3">
          {logs.map((log, i) => (
            <div
              className="flex gap-2 items-center animate-slide-fade-up "
              key={i}
            >
              {log.status === "loading" && (
                <div className="animate-spin">
                  <Loader2 size={19} />
                </div>
              )}
              {log.status === "completed" && (
                <div className="bg-green-500/90 p-0.5 rounded-full">
                  <Check className="text-white" size={14} />
                </div>
              )}
              {log.status === "error" && (
                <div className="bg-red-500/90 p-0.5 rounded-full">
                  <X className="text-white" size={15} />
                </div>
              )}
              <div className="font-medium">
                {t(log.msg, {
                  total: log?.dataT?.total ?? "",
                  current: log?.dataT?.current ?? "",
                })}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

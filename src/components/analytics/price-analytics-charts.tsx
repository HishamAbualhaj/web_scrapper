"use client";
import { usePriceAnalyticsStore } from "@/zustand/priceAnalyticsStore";
import { Loader2Icon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
type ProductPricePoint = {
  date: string;
  price: number;
};

type ProductAnalytics = {
  id: string;
  title: string;
  prices: ProductPricePoint[];
};

type TooltipProps = {
  active?: boolean;
  payload?: any[];
  label?: string;
};

const PriceTooltipRTL = ({ active, payload, label }: TooltipProps) => {
  const t = useTranslations("stores.analytics");

  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border bg-background px-3 py-2 text-sm shadow-md text-right">
      <p className="text-muted-foreground">
        {t("date")}: {label}
      </p>

      <p className="font-semibold text-primary">
        {t("price")}: {payload[0].value}
      </p>
    </div>
  );
};

const PriceAnalyticsCharts = () => {
  const { data, isPending } = usePriceAnalyticsStore();
  const t = useTranslations("state");

  return (
    <div className="h-96 w-full mt-5 relative">
      {isPending && (
        <div className="bg-primary/50 w-full h-full absolute z-10 rounded-md flex gap-2 justify-center items-center">
          {t("loading")} <Loader2Icon size={20} className="animate-spin" />{" "}
        </div>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data ? data.prices : []}
          margin={{ top: 5, right: 5, left: -55, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip content={<PriceTooltipRTL />} />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#2563eb"
            strokeWidth={3}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PriceAnalyticsCharts;

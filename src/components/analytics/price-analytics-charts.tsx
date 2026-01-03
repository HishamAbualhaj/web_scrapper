"use client";
import { useTranslations } from "next-intl";
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
  const productsAnalytics: ProductAnalytics[] = [
    {
      id: "p1",
      title: "iPhone 15 Pro",
      prices: [
        { date: "2025-01-01", price: 3000 },
        { date: "2025-01-05", price: 4500 },
        { date: "2025-01-10", price: 7000 },
        { date: "2025-01-15", price: 8000 },
        { date: "2025-01-20", price: 2000 },
        { date: "2025-01-29", price: 400 },
      ],
    },
  ];
  return (
    <div className="h-96 w-full mt-5">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={productsAnalytics[0].prices}
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

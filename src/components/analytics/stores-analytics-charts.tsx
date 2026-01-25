"use client";

import {
  ResponsiveContainer,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
} from "recharts";
import { Boxes, DollarSign, Percent } from "lucide-react";
import { useTranslations } from "next-intl";

type StoresChartProps = {
  data: {
    store_id: string;
    store_name: string;
    products_count: number;
    avg_price: number;
    avg_discount: number;
  }[];
};

// Custom Tooltip Component
const CustomTooltip = ({
  active,
  payload,
  label,
  metricKey,
  translator,
}: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background/95 backdrop-blur-sm p-3 shadow-lg">
        <p className="font-semibold text-sm mb-1">{label}</p>
        <p className="text-sm text-muted-foreground">
          {translator}:{" "}
          <span className="font-medium text-foreground">
            {payload[0].value}
          </span>
        </p>
      </div>
    );
  }
  return null;
};

export const StoresAnalyticsCharts = ({ data }: StoresChartProps) => {
  const t = useTranslations("stores.analytics");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {/* Products Count */}
      <section className="rounded-xl border bg-card p-4">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <div className="bg-primary/10 text-primary p-3 rounded-lg">
            <Boxes className="h-5 w-5" />
          </div>
          {t("productsCount")}
        </h2>

        <ResponsiveContainer width="100%" height={260}>
          <BarChart
            data={data}
            barCategoryGap={20}
            margin={{ top: 5, right: 5, left: -45, bottom: 5 }}
          >
            <XAxis
              dataKey="store_name"
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip
              content={
                <CustomTooltip
                  metricKey="products_count"
                  translator={t("productsCount")}
                />
              }
              cursor={{ fill: "rgba(96, 165, 250, 0.1)" }}
            />
            <Bar
              dataKey="products_count"
              fill="#60a5fa"
              radius={[6, 6, 0, 0]}
              barSize={28}
            />
          </BarChart>
        </ResponsiveContainer>
      </section>

      {/* Avg Price */}
      <section className="rounded-xl border bg-card p-4">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <div className="bg-primary/10 text-primary p-3 rounded-lg">
            <DollarSign className="h-4 w-4" />
          </div>
          {t("avgPrice")}
        </h2>

        <ResponsiveContainer width="100%" height={260}>
          <BarChart
            data={data}
            barCategoryGap={20}
            margin={{ top: 5, right: 5, left: -45, bottom: 5 }}
          >
            <XAxis
              dataKey="store_name"
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border bg-background/95 backdrop-blur-sm p-3 shadow-lg">
                      <p className="font-semibold text-sm mb-1">{label}</p>
                      <p className="text-sm text-muted-foreground">
                        {t("avgPrice")}:{" "}
                        <span className="font-medium text-foreground">
                          {Number(payload?.[0]?.value).toFixed(2)}
                        </span>
                      </p>
                    </div>
                  );
                }
                return null;
              }}
              cursor={{ fill: "rgba(52, 211, 153, 0.1)" }}
            />
            <Bar
              dataKey="avg_price"
              fill="#34d399"
              radius={[6, 6, 0, 0]}
              barSize={28}
            />
          </BarChart>
        </ResponsiveContainer>
      </section>

      {/* Avg Discount */}
      <section className="rounded-xl border bg-card p-4">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <div className="bg-primary/10 text-primary p-3 rounded-lg">
            <Percent className="h-5 w-5" />
          </div>

          {t("avgDiscount")}
        </h2>

        <ResponsiveContainer width="100%" height={260}>
          <BarChart
            data={data}
            barCategoryGap={20}
            margin={{ top: 5, right: 5, left: -45, bottom: 5 }}
          >
            <XAxis
              dataKey="store_name"
              tick={{ fontSize: 14 }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis tick={{ fontSize: 14 }} axisLine={false} tickLine={false} />

            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border bg-background/95 backdrop-blur-sm p-3 shadow-lg">
                      <p className="font-semibold text-sm mb-1">{label}</p>
                      <p className="text-sm text-muted-foreground">
                        {t("avgDiscount")}:{" "}
                        <span className="font-medium text-foreground">
                          {Number(payload?.[0]?.value).toFixed(1)}
                        </span>
                      </p>
                    </div>
                  );
                }
                return null;
              }}
              cursor={{ fill: "rgba(251, 191, 36, 0.1)" }}
            />
            <Bar
              dataKey="avg_discount"
              fill="#fbbf24"
              radius={[6, 6, 0, 0]}
              barSize={28}
            />
          </BarChart>
        </ResponsiveContainer>
      </section>
    </div>
  );
};

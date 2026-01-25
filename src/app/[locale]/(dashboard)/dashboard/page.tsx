import PriceAnalyticsCharts from "@/components/analytics/price-analytics-charts";
import SelectionData from "@/components/analytics/selection-data";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";

import { SectionCards } from "@/components/section-cards";

export const dynamic = "force-dynamic";

export default async function Page() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL}/api/analytics/overview`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  const resstores = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL}/api/analytics/stores`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  if (!res.ok) {
    const errorData = await res.json();
    console.error(errorData.error || `HTTP error! status: ${res.status}`);
  }
  const data = await res.json();

  const dataStores = await resstores.json();

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 md:gap-6">
          <SectionCards
            total_products={data.total_products}
            total_stores={data.total_stores}
          />
          <div className="">
            <ChartAreaInteractive data={dataStores} />
          </div>
          <div className="border rounded-md p-4">
            <SelectionData />
            <PriceAnalyticsCharts />
          </div>
        </div>
      </div>
    </div>
  );
}

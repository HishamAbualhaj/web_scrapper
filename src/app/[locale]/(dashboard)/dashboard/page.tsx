import PriceAnalyticsCharts from "@/components/analytics/price-analytics-charts";
import SelectionData from "@/components/analytics/selection-data";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";

import { SectionCards } from "@/components/section-cards";

export default function Page() {

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 md:gap-6">
          <SectionCards />
          <div className="">
            <ChartAreaInteractive />
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

import { StoresAnalyticsCharts } from "./analytics/stores-analytics-charts";
interface ChartAreaInteractiveProps {
  data: {
    store_id: string;
    store_name: string;
    products_count: number;
    avg_price: number;
    avg_discount: number;
  }[];
}
export function ChartAreaInteractive({ data }: ChartAreaInteractiveProps) {
  return (
    <div className="space-y-8">
      <StoresAnalyticsCharts data={data} />
    </div>
  );
}

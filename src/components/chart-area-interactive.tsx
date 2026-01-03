import { StoresAnalyticsCharts } from "./analytics/stores-analytics-charts";
export function ChartAreaInteractive() {
  const stores = [
    {
      id: "1",
      name: "Electronics",
      productsCount: 24,
      avgPrice: 1200,
      avgDiscount: 15,
    },
    {
      id: "2",
      name: "Fashion",
      productsCount: 12,
      avgPrice: 80,
      avgDiscount: 5,
    },
    { id: "3", name: "Toys", productsCount: 35, avgPrice: 50, avgDiscount: 10 },
  ];
  return (
    <div className="space-y-8">
      <StoresAnalyticsCharts data={stores} />
    </div>
  );
}

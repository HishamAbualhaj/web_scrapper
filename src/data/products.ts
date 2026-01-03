type ProductPricePoint = { date: string; price: number };
type ProductAnalytics = {
  id: string;
  title: string;
  prices: ProductPricePoint[];
};
const productsAnalytics: ProductAnalytics[] = [
  {
    id: "p1",
    title: "iPhone 15 Pro",
    prices: [
      { date: "2025-01-01", price: 4200 },
      { date: "2025-01-05", price: 4100 },
      { date: "2025-01-10", price: 4050 },
    ],
  },
  {
    id: "p2",
    title: "iPhone 15 Pro",
    prices: [
      { date: "2025-01-01", price: 4200 },
      { date: "2025-01-05", price: 4100 },
      { date: "2025-01-10", price: 4050 },
    ],
  },
  {
    id: "p3",
    title: "iPhone 15 Pro",
    prices: [
      { date: "2025-01-01", price: 4200 },
      { date: "2025-01-05", price: 4100 },
      { date: "2025-01-10", price: 4050 },
    ],
  },
  {
    id: "p4",
    title: "iPhone 15 Pro",
    prices: [
      { date: "2025-01-01", price: 4200 },
      { date: "2025-01-05", price: 4100 },
      { date: "2025-01-10", price: 400 },
    ],
  },
];

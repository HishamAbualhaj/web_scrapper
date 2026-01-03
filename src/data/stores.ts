export type Store = {
  id: string;
  title: string;
  products: {
    id: string;
    title: string;
  }[];
};

export const stores: Store[] = [
  {
    id: "s1",
    title: "Noon",
    products: [
      { id: "p1", title: "iPhone 15 Pro" },
      { id: "p2", title: "MacBook Pro M3" },
      { id: "p3", title: "AirPods Pro" },
    ],
  },
  {
    id: "s2",
    title: "Amazon",
    products: [
      { id: "p4", title: "Samsung S24 Ultra" },
      { id: "p5", title: "Sony WH-1000XM5" },
    ],
  },
];

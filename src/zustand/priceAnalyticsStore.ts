import { ProductAnalytics } from "@/types/api/response";
import { create } from "zustand";

type PriceAnalyticsState = {
  isPending: boolean;
  data: ProductAnalytics | null;

  setPending: (value: boolean) => void;
  setData: (data: ProductAnalytics) => void;
  reset: () => void;
};

export const usePriceAnalyticsStore = create<PriceAnalyticsState>((set) => ({
  isPending: false,
  data: null,

  setPending: (value) => set({ isPending: value }),

  setData: (data) =>
    set({
      data,
      isPending: false,
    }),

  reset: () =>
    set({
      isPending: false,
      data: null,
    }),
}));

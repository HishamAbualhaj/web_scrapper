"use client";

import SelectStore from "@/components/analytics/select-store";
import { useApiQuery } from "@/hooks/useApiQuery";
import { ProductAnalytics } from "@/types/api/response";
import { usePriceAnalyticsStore } from "@/zustand/priceAnalyticsStore";
import { useQueryState } from "nuqs";
import { useEffect, useRef } from "react";

const SelectionData = () => {
  const [product] = useQueryState("product");

  const setData = usePriceAnalyticsStore((s) => s.setData);
  const setPending = usePriceAnalyticsStore((s) => s.setPending);

  // ✅ Stable refs so useEffect deps don't change on every render
  const setDataRef = useRef(setData);
  const setPendingRef = useRef(setPending);
  useEffect(() => { setDataRef.current = setData; }, [setData]);
  useEffect(() => { setPendingRef.current = setPending; }, [setPending]);

  const { data: dataProductsAnalytics, isFetching: isPendingProductPrice } =
    useApiQuery<ProductAnalytics>(
      ["product_analytics", product],
      {
        apiUrl: "/api/getProductPrice",
        method: "POST",
        body: { productId: product },
      },
      { enabled: !!product },
    );

  // ✅ Only fires when data actually changes — not on every render
  useEffect(() => {
    if (dataProductsAnalytics) {
      setDataRef.current(dataProductsAnalytics);
    }
  }, [dataProductsAnalytics]);

  // ✅ Only fires when isFetching flips (boolean), not on every render
  //    setData already sets isPending:false internally, so this only
  //    needs to handle the true→false transition for the loading state
  useEffect(() => {
    setPendingRef.current(isPendingProductPrice);
  }, [isPendingProductPrice]);

  return (
    <div className="flex max-lg:flex-col gap-6">
      <SelectStore withUrlState={true} />
    </div>
  );
};

export default SelectionData;
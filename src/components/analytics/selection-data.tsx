"use client";
import SelectProduct from "@/components/analytics/select-product";
import SelectStore from "@/components/analytics/select-store";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useApiQuery } from "@/hooks/useApiQuery";
import {
  getProductsResponse,
  ProductAnalytics,
  Store,
} from "@/types/api/response";
import { usePriceAnalyticsStore } from "@/zustand/priceAnalyticsStore";
import { useQueryState } from "nuqs";
import { useEffect } from "react";
const SelectionData = () => {
  const [store] = useQueryState("store");

  const [product, setProduct] = useQueryState("product");

  const { setData, setPending } = usePriceAnalyticsStore();
  const { data: dataProducts, isPending } = useApiQuery<getProductsResponse[]>(
    ["products_selection", store],
    {
      apiUrl: "/api/getProducts",
      method: "POST",
      body: {
        store_id: store,
      },
    },
    { enabled: !!store },
  );

  const {
    data: dataProductsAnalytics,
    isFetching: isPendingProductPrice,
  } = useApiQuery<ProductAnalytics>(
    ["product_analytics", product],
    {
      apiUrl: "/api/getProductPrice",
      method: "POST",
      body: {
        productId: product,
      },
    },
    { enabled: !!product },
  );

  useEffect(() => {
    if (dataProductsAnalytics) {
      setData(dataProductsAnalytics);
    }
  }, [dataProductsAnalytics]);

  useEffect(() => {
    setPending(isPendingProductPrice);
  }, [isPendingProductPrice]);

  return (
    <div className="flex max-lg:flex-col gap-6">
      <SelectStore withUrlState={true} />

      {store && (
        <SelectProduct
          isPending={isPending}
          products={dataProducts ?? []}
          onSelect={(productId) => {
            if (isPendingProductPrice) return;
            setProduct(productId);
          }}
        />
      )}
    </div>
  );
};

export default SelectionData;

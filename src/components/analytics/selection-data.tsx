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
import { useMutation, useQuery } from "@tanstack/react-query";
import { useQueryState } from "nuqs";
import { useEffect } from "react";
const SelectionData = () => {
  const [store] = useQueryState("store");

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

  const { data: dataStores } = useApiQuery<Store[]>(["stores"], {
    apiUrl: "/api/analytics/stores",
    method: "GET",
  });

  const {
    mutate,
    isPending: isPendingProductPrice,
    data,
  } = useApiMutation<ProductAnalytics, { productId: string }>();

  return (
    <div className="flex max-lg:flex-col gap-6">
      <SelectStore
        withUrlState={true}
        stores={
          dataStores?.map(
            ({ store_id, store_name, products_count, created_at }) => ({
              store_id,
              store_name,
              products_count,
              created_at,
            }),
          ) ?? []
        }
        value={store ?? ""}
      />

      {store && (
        <SelectProduct
          isPending={isPending}
          products={dataProducts ?? []}
          onSelect={(productId) => {
            if (isPendingProductPrice) return;
            mutate({
              apiUrl: "/api/getProductPrice",
              method: "POST",
              body: {
                productId,
              },
            });
          }}
        />
      )}
    </div>
  );
};

export default SelectionData;

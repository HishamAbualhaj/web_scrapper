"use client";
import SelectProduct from "@/components/analytics/select-product";
import SelectStore from "@/components/analytics/select-store";
import { stores } from "@/data/stores";
import { useQueryState } from "nuqs";
const SelectionData = () => {
  const [store] = useQueryState("store");
  const storeSelected = stores.find((s) => s.id === store);
  return (
    <div className="flex max-lg:flex-col gap-6">
      <SelectStore stores={stores} value={store ?? ""} />

      {store && (
        <SelectProduct
          products={storeSelected?.products ?? []}
          onSelect={(productId) => {
            console.log("Selected product:", productId);
          }}
        />
      )}
    </div>
  );
};

export default SelectionData;

"use client"
import SelectProduct from "@/components/analytics/select-product";
import SelectStore from "@/components/analytics/select-store";
import { stores } from "@/data/stores";
import { useState } from "react";
const SelectionData = () => {
  const [storeId, setStoreId] = useState<string>("");

  const store = stores.find((s) => s.id === storeId);
  return (
    <div className="flex max-lg:flex-col gap-6">
      <SelectStore stores={stores} value={storeId} onChange={setStoreId} />

      {store && (
        <SelectProduct
          products={store.products}
          onSelect={(productId) => {
            console.log("Selected product:", productId);
          }}
        />
      )}
    </div>
  );
};

export default SelectionData;

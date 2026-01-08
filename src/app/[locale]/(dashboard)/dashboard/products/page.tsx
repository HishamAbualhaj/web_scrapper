"use client";
import { DataTable } from "@/components/data-table";
import data from "../data.json";
import ProductTableFilters from "@/components/products/filter-products";
import { Button } from "@/components/ui/button";
import { AddProductDialog } from "@/components/products/add-product-dialog";
import { useTranslations } from "next-intl";
import { useState } from "react";
import SelectStore from "@/components/analytics/select-store";

const page = () => {
  const t = useTranslations("products");
  const [open, setOpen] = useState<boolean>(false);
  return (
    <>
      <div className="flex flex-col gap-5 mb-5">
        <Button
          className="w-fit"
          onClick={() => {
            setOpen(true);
          }}
        >
          {t("add")}
        </Button>
        {/* Store name */}
        <SelectStore
          stores={[
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
          ]}
        />
      </div>
      <AddProductDialog
        open={open}
        onClose={() => {
          setOpen(false);
        }}
      />
      <ProductTableFilters />
      <div className="py-5">
        <DataTable data={data} />
      </div>
    </>
  );
};

export default page;

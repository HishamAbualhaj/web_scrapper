"use client";
import { DataTable } from "@/components/data-table";
import ProductTableFilters from "@/components/products/filter-products";
import { Button } from "@/components/ui/button";
import { AddProductDialog } from "@/components/products/add-product-dialog";
import { useTranslations } from "next-intl";
import { useState } from "react";
import SelectStore from "@/components/analytics/select-store";
import { useQueryStates, parseAsString, parseAsInteger } from "nuqs";
import { DataTableFilters } from "@/types/products";

const page = () => {
  const t = useTranslations("products");
  const [open, setOpen] = useState<boolean>(false);

  const [filters] = useQueryStates({
    store: parseAsString,
    name: parseAsString,
    badge: parseAsString,
    discount: parseAsString,
    min: parseAsInteger,
    max: parseAsInteger,
    stock: parseAsInteger,
  });

  const tableFilters: DataTableFilters = {
    store: filters.store ?? undefined,
    name: filters.name ?? undefined,
    badge: filters.badge ?? undefined,
    discount: filters.discount as "with" | "without" | undefined,
    min: filters.min || undefined,
    max: filters.max || undefined,
    stock: filters.stock || undefined,
  };

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
        <SelectStore withUrlState={true} />
      </div>
      <AddProductDialog
        open={open}
        onClose={() => {
          setOpen(false);
        }}
      />
      <ProductTableFilters />
      <div className="py-5">
        <DataTable filters={tableFilters} />
      </div>
    </>
  );
};

export default page;

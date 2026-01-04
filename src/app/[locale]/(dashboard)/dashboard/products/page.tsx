"use client";
import { DataTable } from "@/components/data-table";
import data from "../data.json";
import ProductTableFilters from "@/components/products/filter-products";
import { Button } from "@/components/ui/button";
import { AddProductDialog } from "@/components/products/add-product-dialog";
import { useTranslations } from "next-intl";
import { useState } from "react";

const page = () => {
  const t = useTranslations("products");
  const [open, setOpen] = useState<boolean>(false);
  return (
    <>
      <div className="mb-5">
        <Button
          onClick={() => {
            setOpen(true);
          }}
        >
          {t("add")}
        </Button>
      </div>
      <AddProductDialog
        open={open}
        onClose={() => {
          setOpen(false);
        }}
      />
      <ProductTableFilters />
      <div className="py-5">
        <DataTable data={data} />;
      </div>
    </>
  );
};

export default page;

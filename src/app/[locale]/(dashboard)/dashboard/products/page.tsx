"use client"
import { DataTable } from "@/components/data-table";
import data from "../data.json";
import ProductTableFilters from "@/components/FilterProducts";
import { DirectionProvider } from "@radix-ui/react-direction";
import { useLocale } from "next-intl";
const page = () => {
  const locale = useLocale();
  return (
    <>
      <div className="">
        <DirectionProvider dir={locale === "ar" ? "rtl" : "ltr"}>
          <ProductTableFilters />
        </DirectionProvider>
      </div>
      <div className="py-5">
        <DataTable data={data} />;
      </div>
    </>
  );
};

export default page;

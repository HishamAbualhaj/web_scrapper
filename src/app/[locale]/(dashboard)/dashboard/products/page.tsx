"use client";
import { DataTable } from "@/components/data-table";
import data from "../data.json";
import ProductTableFilters from "@/components/FilterProducts";

const page = () => {
  return (
    <>
      <div className="">
        <ProductTableFilters />
      </div>
      <div className="py-5">
        <DataTable data={data} />;
      </div>
    </>
  );
};

export default page;

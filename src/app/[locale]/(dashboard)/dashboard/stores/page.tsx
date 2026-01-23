"use client";
import { AddStoreDialog } from "@/components/stores/add-store-dialog";
import ScrapeProgressCard from "@/components/scrape/ScrapeProgressCard";
import { StoreCard } from "@/components/stores/store-card";
import { Button } from "@/components/ui/button";
import useScrapeProducts from "@/hooks/useScrapeProducts";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useScrape } from "@/context/ScrapeContext";

const page = () => {
  const stores = [
    {
      id: "store-1",
      name: "Electronics",
      productsCount: 24,
      isActive: true,
      createdAt: String(new Date()),
    },
    {
      id: "store-2",
      name: "Fashion",
      productsCount: 12,
      isActive: false,
      createdAt: String(new Date()),
    },
  ];
  const t = useTranslations("stores");
  const [open, setOpen] = useState<boolean>(false);

  const { isScraping } = useScrape();

  return (
    <div className="space-y-6">
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4 me-2" />
        {t("addStore")}
      </Button>
      <AddStoreDialog
        open={open}
        isScraping={isScraping}
        onClose={() => {
          setOpen(false);
        }}
      />
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{t("title")}</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stores.map((store) => (
          <StoreCard key={store.id} {...store} />
        ))}
      </div>
    </div>
  );
};

export default page;

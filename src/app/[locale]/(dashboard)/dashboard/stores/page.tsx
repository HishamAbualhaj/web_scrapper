"use client";
import { AddStoreDialog } from "@/components/stores/add-store-dialog";
import { StoreCard } from "@/components/stores/store-card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useScrape } from "@/context/ScrapeContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Store } from "@/types/api/response";
import { useApiQuery } from "@/hooks/useApiQuery";

const page = () => {
  const { data: dataStores, isPending } = useApiQuery<Store[]>(["stores"], {
    apiUrl: "/api/analytics/stores",
    method: "GET",
  });

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
        {isPending ? (
          <Card className="relative rounded-md">
            <CardHeader className="flex flex-row items-start justify-between">
              <div className="space-y-2">
                {/* Store name */}
                <Skeleton className="h-4 w-40" />

                {/* Products count */}
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-3 w-28" />
                </div>
              </div>

              {/* Actions menu */}
              <Skeleton className="h-6 w-6 rounded-md" />
            </CardHeader>

            <CardContent>
              <div className="flex items-center gap-2">
                {/* Calendar icon */}
                <Skeleton className="h-4 w-4 rounded-full" />
                {/* Date */}
                <Skeleton className="h-3 w-24" />
              </div>
            </CardContent>
          </Card>
        ) : (
          dataStores?.map((store) => (
            <StoreCard key={store.store_id} {...store} />
          ))
        )}
      </div>
    </div>
  );
};

export default page;

"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link, Loader2 } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import SelectStore from "../analytics/select-store";
import { useApiMutation } from "@/hooks/useApiMutation";
import { scrapeSingleProductResponse } from "@/types/api/response";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onClose: () => void;
};

export const AddProductDialog = ({ open, onClose }: Props) => {
  const t = useTranslations("products");
  const p = useTranslations("scraping");
  const [productId, setProductId] = useState("");
  const [store_id, setStoreId] = useState("");

  const { mutateAsync, isPending } = useApiMutation<
    scrapeSingleProductResponse,
    { store_id: string; productId: string }
  >();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("add")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Product ID */}
          <div className="relative">
            <Link className="absolute start-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("fields.urlPlaceholder")}
              className="ps-9"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
            />
          </div>

          {/* Store Name (optional) */}
          <div className="relative">
            <SelectStore
              setStore={(value) => {
                setStoreId(value);
              }}
              value={store_id}
            />
          </div>

          <Button
            className="w-full"
            onClick={async () => {
              if (isPending) return;
              toast.promise(
                () =>
                  mutateAsync({
                    apiUrl: "/api/scrapeProduct",
                    method: "POST",
                    body: { store_id, productId },
                  }),
                {
                  loading: <div className="text-lg">{p("loading")}</div>,
                  success: (data) => (
                    <div className="text-lg">
                      {data.results.isFound
                        ? p(`scrape_single_product.productFound`)
                        : p("scrape_single_product.scraping_done")}
                    </div>
                  ),
                  error: (
                    <div className="text-lg text-destructive/90!">
                      {p("error")}
                    </div>
                  ),
                },
              );
            }}
          >
            {isPending && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
            {t("actions.create")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

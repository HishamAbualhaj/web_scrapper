"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Store, Link, Loader2 } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Select, SelectContent, SelectTrigger } from "../ui/select";
import SelectStore from "../analytics/select-store";

type Props = {
  open: boolean;
  onClose: () => void;
};

export const AddProductDialog = ({ open, onClose }: Props) => {
  const t = useTranslations("products");
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUrlBlur = () => {
    if (!name && url) {
      try {
        const hostname = new URL(url).hostname.replace("www.", "");
        setName(hostname.split(".")[0]);
      } catch {}
    }
  };

  const handleSubmit = async () => {
    if (!url) return;

    setLoading(true);

    // API later
    console.log({ url, name });

    setLoading(false);
    onClose();
  };

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
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onBlur={handleUrlBlur}
            />
          </div>

          {/* Store Name (optional) */}
          <div className="relative">
            <SelectStore
              stores={[
                {
                  id: "1",
                  title: "عام",
                  products: [
                    {
                      id: "",
                      title: "",
                    },
                  ],
                },
                {
                  id: "2",
                  title: "Store",
                  products: [
                    {
                      id: "",
                      title: "",
                    },
                  ],
                },
                {
                  id: "3",
                  title: "Store",
                  products: [
                    {
                      id: "",
                      title: "",
                    },
                  ],
                },
                {
                  id: "4",
                  title: "Store",
                  products: [
                    {
                      id: "",
                      title: "",
                    },
                  ],
                },
              ]}
            />
          </div>

          <Button
            className="w-full"
            disabled={!url || loading}
            onClick={handleSubmit}
          >
            {loading && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
            {t("actions.create")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

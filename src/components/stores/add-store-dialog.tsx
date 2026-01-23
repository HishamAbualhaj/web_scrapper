"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Store, Link, Loader2, Loader2Icon } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useScrape } from "@/context/ScrapeContext";

type Props = {
  open: boolean;
  onClose: () => void;
  isScraping: boolean;
};

export const AddStoreDialog = ({ open, onClose, isScraping }: Props) => {
  const t = useTranslations("stores");
  const s = useTranslations("scraping");
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");

  const { startScraping } = useScrape();

  const handleSubmit = async () => {
    await startScraping(url, name);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("addStore")}</DialogTitle>
        </DialogHeader>
        {isScraping ? (
          <div className="flex justify-center gap-3 items-center mt-5">
            <Loader2Icon size={19} className="animate-spin" />
            <div className="text-xl font-medium">{s("active")}</div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Store URL */}
            <div className="relative">
              <Link className="absolute start-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("fields.urlPlaceholder")}
                className="ps-9"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>

            {/* Store Name (optional) */}
            <div className="relative">
              <Store className="absolute start-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("fields.nameOptional")}
                className="ps-9"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <Button
              className="w-full"
              disabled={!url || isScraping}
              onClick={handleSubmit}
            >
              {isScraping && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
              {t("actions.create")}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

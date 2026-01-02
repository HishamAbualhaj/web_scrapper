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

type Props = {
  open: boolean;
  onClose: () => void;
};

export const AddStoreDialog = ({ open, onClose }: Props) => {
  const t = useTranslations("stores");
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
          <DialogTitle>{t("addStore")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Store URL */}
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

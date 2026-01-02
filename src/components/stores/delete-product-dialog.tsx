"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  productName?: string;
  onConfirm: () => Promise<void> | void;
};

export const DeleteProductDialog = ({
  open,
  onClose,
  productName,
  onConfirm,
}: Props) => {
  const t = useTranslations("products.delete");
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    await onConfirm();
    setLoading(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-1 text-destructive mr-5">
            <Trash2 className="h-5 w-5" />
            {t("title")}
          </DialogTitle>

          <DialogDescription>
            {t("description", { name: productName || t("thisProduct") })}
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={onClose}>
            {t("cancel")}
          </Button>

          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
            {t("confirm")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

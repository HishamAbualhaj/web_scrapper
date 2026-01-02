"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  Package,
  Calendar,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { DeleteProductDialog } from "./delete-product-dialog";

type StoreCardProps = {
  id: string;
  name: string;
  productsCount: number;
  createdAt: string;
};

export const StoreCard = ({
  id,
  name,
  productsCount,
  createdAt,
}: StoreCardProps) => {
  const router = useRouter();
  const t = useTranslations("stores");
  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  return (
    <Card className="relativ rounded-md">
      <DeleteProductDialog
        open={open}
        onClose={() => setOpen(false)}
        productName={selectedProduct?.title}
        onConfirm={async () => {}}
      />

      <CardHeader className="flex flex-row items-start justify-between">
        <div className="space-y-1">
          <h3 className="text-base font-semibold">{name}</h3>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Package className="h-4 w-4" />
            <span>{t("productsCount", { count: productsCount })}</span>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="rounded-md p-1 hover:bg-muted">
              <MoreVertical className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => router.push(`products?store=${id}`)}
            >
              <Eye className="h-4 w-4 mr-2" />
              {t("actions.viewProducts")}
            </DropdownMenuItem>

            {/* <DropdownMenuItem>
              <Pencil className="h-4 w-4 mr-2" />
              {t("actions.edit")}
            </DropdownMenuItem> */}

            <DropdownMenuItem
              onClick={() => {
                setSelectedProduct("");
                setOpen(true);
              }}
              className="text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {t("actions.delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>
            {t("createdAt", {
              date: new Date(createdAt).toLocaleDateString(),
            })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

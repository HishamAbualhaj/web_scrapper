"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Package, Calendar, Eye, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { DeleteProductDialog } from "./delete-product-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiMutation } from "@/hooks/useApiMutation";

type StoreCardProps = {
  store_id: string;
  store_name: string;
  products_count: number;
  created_at: string;
};

export const StoreCard = ({
  store_id,
  store_name,
  products_count,
  created_at,
}: StoreCardProps) => {
  const router = useRouter();
  const t = useTranslations("stores");
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { mutateAsync } = useApiMutation<
    { success: boolean },
    { store_id: string }
  >({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["stores"],
      });
    },
  });
  return (
    <Card className="relativ rounded-md">
      <DeleteProductDialog
        open={open}
        onClose={() => setOpen(false)}
        productName={store_name}
        onConfirm={async () => {
          await mutateAsync({
            apiUrl: "/api/deleteStore",
            method: "DELETE",
            body: { store_id },
          });
        }}
      />

      <CardHeader className="flex flex-row items-start justify-between">
        <div className="space-y-1">
          <h3 className="text-base font-semibold">{store_name}</h3>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Package className="h-4 w-4" />
            <span>{t("productsCount", { count: products_count })}</span>
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
              onClick={() => router.push(`products?store=${store_id}`)}
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
              date: new Date(created_at).toLocaleDateString(),
            })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useQueryState } from "nuqs";
import { Loader2Icon } from "lucide-react";

type Product = {
  product_id: string;
  store_id: string;
  external_product_id: string;
  title: string;
};

type Props = {
  products: Product[] | undefined;
  onSelect: (productId: string) => void; // 👉 triggers DB + chart
  isPending: boolean;
};

const SelectProduct = ({ products, onSelect, isPending }: Props) => {
  const t = useTranslations();
  const [open, setOpen] = useState(false);

  const [product] = useQueryState("product");
  const selected = products?.find((p) => p.product_id === product);

  return (
    <div className="space-y-2 max-w-96">
      <div className="text-muted-foreground">{t("products.selectProduct")}</div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="w-full justify-between md:min-w-80"
          >
            {selected ? (
              <div className="line-clamp-1">{selected.title}</div>
            ) : (
              t("products.placeholder")
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="max-h-100 p-0">
          <Command>
            <CommandInput placeholder={t("products.search")} />
            {isPending ? (
              <div className="p-5 flex gap-2 items-center">
                <Loader2Icon className="animate-spin" size={20} />
                {t("products.loading")}
              </div>
            ) : (
              <CommandEmpty>{t("products.noResults")}</CommandEmpty>
            )}

            <CommandGroup className="max-h-100 overflow-auto">
              {products?.map((product) => (
                <CommandItem
                  key={product.product_id}
                  value={product.title}
                  onSelect={() => {
                    setOpen(false);
                    onSelect(product.product_id);
                  }}
                >
                  {product.title}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default SelectProduct;

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

type Product = {
  id: string;
  title: string;
};

type Props = {
  products: Product[];
  onSelect: (productId: string) => void; // 👉 triggers DB + chart
};

const SelectProduct = ({ products, onSelect }: Props) => {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<string>("");

  const selected = products.find((p) => p.id === value);

  return (
    <div className="space-y-2 max-w-96">
      <div className="text-muted-foreground">{t("products.selectProduct")}</div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="w-full justify-between min-w-52"
          >
            {selected ? selected.title : t("products.placeholder")}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="p-0">
          <Command>
            <CommandInput placeholder={t("products.search")} />
            <CommandEmpty>{t("products.noResults")}</CommandEmpty>

            <CommandGroup>
              {products.map((product) => (
                <CommandItem
                  key={product.id}
                  value={product.title}
                  onSelect={() => {
                    setValue(product.id);
                    setOpen(false);
                    onSelect(product.id);
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

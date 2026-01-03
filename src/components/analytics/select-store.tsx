"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Store } from "@/data/stores";
import { useTranslations } from "next-intl";

type Props = {
  stores: Store[];
  value?: string;
  onChange: (storeId: string) => void;
};

const SelectStore = ({ stores, value, onChange }: Props) => {
  const t = useTranslations("stores.actions");

  return (
    <div className="space-y-2 max-w-96">
      <div className="text-muted-foreground">{t("selectStore")}</div>

      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="min-w-52">
          <SelectValue placeholder={t("placeholder")} />
        </SelectTrigger>
        <SelectContent>
          {stores.map((store) => (
            <SelectItem key={store.id} value={store.id}>
              {store.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default SelectStore;

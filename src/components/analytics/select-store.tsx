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
import { useQueryState } from "nuqs";
type Props = {
  stores: Store[];
  value?: string;
  error?: string | null;
};

const SelectStore = ({ stores, value, error }: Props) => {
  const [storeId, setStoreId] = useQueryState("store", {
    defaultValue: "general",
    shallow: true,
  });

  const t = useTranslations("stores.actions");

  return (
    <div className="space-y-2 max-w-96">
      <div className="text-muted-foreground">{t("selectStore")}</div>

      <Select value={value} onValueChange={setStoreId}>
        <SelectTrigger
          className={`min-w-52 ${error ? "border-destructive" : ""}`}
        >
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
      {error && (
        <div className="text-destructive text-sm">{t("validationError")}</div>
      )}
    </div>
  );
};

export default SelectStore;

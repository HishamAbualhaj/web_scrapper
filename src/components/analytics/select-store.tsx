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
  error?: string | null;
};

const SelectStore = ({ stores, value, onChange, error }: Props) => {
  const t = useTranslations("stores.actions");

  return (
    <div className="space-y-2 max-w-96">
      <div className="text-muted-foreground">{t("selectStore")}</div>

      <Select value={value} onValueChange={onChange}>
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

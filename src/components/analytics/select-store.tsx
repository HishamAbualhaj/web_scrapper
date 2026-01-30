"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApiQuery } from "@/hooks/useApiQuery";
import { Store } from "@/types/api/response";
import { useTranslations } from "next-intl";
import { useQueryState } from "nuqs";
import { Dispatch, SetStateAction } from "react";

type Props = {
  setStore?: Dispatch<SetStateAction<string>>;
  withUrlState?: boolean;
  value?: string;
  error?: string | null;
};

const SelectStore = ({
  value,
  error,
  withUrlState = false,
  setStore,
}: Props) => {
  const t = useTranslations("stores.actions");

  const p = useTranslations("filter");
  // URL state (used ONLY when withUrlState === true)
  const [urlStore, setUrlStore] = useQueryState("store", {
    defaultValue: "all",
    shallow: true,
  });

  const { data: dataStores } = useApiQuery<Store[]>(["stores"], {
    apiUrl: "/api/analytics/stores",
    method: "GET",
  });

  const selectValue = withUrlState ? urlStore : value || undefined; // undefined → placeholder

  const handleChange = (val: string) => {
    if (withUrlState) {
      setUrlStore(val);
    } else {
      setStore?.(val);
    }
  };

  return (
    <div className="space-y-2 max-w-96">
      <div className="text-muted-foreground">{t("selectStore")}</div>

      <Select
        value={selectValue === "all" ? undefined : selectValue}
        onValueChange={handleChange}
      >
        <SelectTrigger
          className={`min-w-52 ${error ? "border-destructive" : ""}`}
        >
          <SelectValue placeholder={t("placeholder")} />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="noStore">{p("nostore")}</SelectItem>
          {dataStores?.map((store) => (
            <SelectItem key={store.store_id} value={store.store_id}>
              {store.store_name}
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

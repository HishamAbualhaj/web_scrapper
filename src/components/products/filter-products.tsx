"use client";
import { useLocale, useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { parseAsString, useQueryState, useQueryStates } from "nuqs";

export type ProductFilters = {
  name: string;
  badge: "all" | "best" | "popular";
  discount: "all" | "with" | "without";
  minStock: number;
  minPrice: number;
  maxPrice: number;
};

export default function ProductTableFilters() {
  const t = useTranslations("filter");
  const locale = useLocale();

  const [name, setName] = useQueryState("name", { defaultValue: "" });
  const [badge, setBadge] = useQueryState("badge", { defaultValue: "all" });
  const [discount, setDiscount] = useQueryState("discount", {
    defaultValue: "all",
  });

  const [minPrice, setMinPrice] = useQueryState("min", {
    defaultValue: 0,
    parse: Number,
  });

  const [maxPrice, setMaxPrice] = useQueryState("max", {
    defaultValue: 0,
    parse: Number,
  });

  const [minStock, setMinStock] = useQueryState("stock", { defaultValue: "" });


  const [, setFilters] = useQueryStates({
    name: parseAsString.withDefault(""),
    badge: parseAsString.withDefault("all"),
    discount: parseAsString.withDefault("all"),
    min: parseAsString.withDefault(""),
    max: parseAsString.withDefault(""),
    stock: parseAsString.withDefault(""),
    store: parseAsString.withDefault("all"),
  });
  const resetAll = () => setFilters(null);

  return (
    <Card className="rounded-md">
      <CardContent className="p-4">
        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-center">
          {/* Product Name */}
          <div className="flex flex-col gap-3">
            <div className="text-muted-foreground">{t("name")}</div>
            <Input
              placeholder={t("name")}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Badge */}
          <div className="flex flex-col gap-3">
            <div className="text-muted-foreground">{t("badge")}</div>
            <Select value={badge} onValueChange={setBadge}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Badge" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("badge_all")}</SelectItem>
                <SelectItem value="best">{t("badge_best")}</SelectItem>
                <SelectItem value="popular">{t("badge_popular")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Discount */}
          <div className="flex flex-col gap-3">
            <div className="text-muted-foreground">{t("discount")}</div>
            <Select value={discount} onValueChange={setDiscount}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Discount" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("discount_all")}</SelectItem>
                <SelectItem value="with">{t("discount_with")}</SelectItem>
                <SelectItem value="without">{t("discount_without")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Price */}
          <div className="flex flex-col gap-3">
            <div className="text-muted-foreground">{t("price")}</div>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                min={0}
                max={maxPrice}
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(Number(e.target.value))}
              />

              <Input
                type="number"
                min={minPrice}
                max={10000}
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
              />
            </div>
          </div>

          {/* Stock */}
          <div className="flex flex-col gap-3">
            <div className="text-muted-foreground">{t("stock")}</div>
            <Input
              type="number"
              min={0}
              placeholder={t("stock")}
              value={minStock}
              onChange={(e) => setMinStock(e.target.value)}
            />
          </div>
        </div>

        {/* Actions */}
        <div
          className={`mt-4 flex ${
            locale === "en" ? "justify-end" : "justify-start"
          } gap-2 border-t pt-4`}
        >
          <Button variant="outline" onClick={resetAll}>
            {t("reset")}
          </Button>
          <Button>{t("apply")}</Button>
        </div>
      </CardContent>
    </Card>
  );
}

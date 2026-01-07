"use client";

import { useState } from "react";
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
  discount: "all" | "with";
  minStock: string;
  minReview: "all" | "3" | "4";
};

export default function ProductTableFilters() {
  const t = useTranslations("filter");
  const locale = useLocale();

  const [name, setName] = useQueryState("name", { defaultValue: "" });
  const [badge, setBadge] = useQueryState("badge", { defaultValue: "all" });
  const [discount, setDiscount] = useQueryState("discount", {
    defaultValue: "all",
  });
  const [minReview, setMinReview] = useQueryState("review", {
    defaultValue: "all",
  });
  const [minStock, setMinStock] = useQueryState("stock", { defaultValue: "" });
  const [, setFilters] = useQueryStates({
    name: parseAsString.withDefault(""),
    badge: parseAsString.withDefault("all"),
    discount: parseAsString.withDefault("all"),
    review: parseAsString.withDefault("all"),
    stock: parseAsString.withDefault(""),
    store: parseAsString.withDefault("all"),
  });
  const resetAll = () => setFilters(null);

  return (
    <Card className="rounded-md">
      <CardContent className="p-4">
        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Product Name */}
          <Input
            placeholder={t("name")}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          {/* Badge */}
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

          {/* Discount */}
          <Select value={discount} onValueChange={setDiscount}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Discount" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("discount_all")}</SelectItem>
              <SelectItem value="with">{t("discount_with")}</SelectItem>
            </SelectContent>
          </Select>

          {/* Reviews */}
          <Select value={minReview} onValueChange={setMinReview}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Reviews" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("reviews_all")}</SelectItem>
              <SelectItem value="3">{t("reviews_3")}</SelectItem>
              <SelectItem value="4">{t("reviews_4")}</SelectItem>
            </SelectContent>
          </Select>

          {/* Stock */}
          <Input
            type="number"
            min={0}
            placeholder={t("stock")}
            value={minStock}
            onChange={(e) => setMinStock(e.target.value)}
          />
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

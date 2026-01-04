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

export type ProductFilters = {
  name: string;
  badge: "all" | "best" | "popular";
  discount: "all" | "with";
  minStock: string;
  minReview: "all" | "3" | "4";
};

const INITIAL_FILTERS: ProductFilters = {
  name: "",
  badge: "all",
  discount: "all",
  minStock: "",
  minReview: "all",
};

export default function ProductTableFilters() {
  const t = useTranslations("filter");
  const locale = useLocale();
  const [filters, setFilters] = useState<ProductFilters>(INITIAL_FILTERS);

  return (
    <Card className="rounded-md">
      <CardContent className="p-4">
        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Product Name */}
          <Input
            placeholder={t("name")}
            value={filters.name}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, name: e.target.value }))
            }
          />

          {/* Badge */}
          <Select
            value={filters.badge}
            onValueChange={(value: ProductFilters["badge"]) =>
              setFilters((prev) => ({ ...prev, badge: value }))
            }
          >
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
          <Select
            value={filters.discount}
            onValueChange={(value: ProductFilters["discount"]) =>
              setFilters((prev) => ({ ...prev, discount: value }))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Discount" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("discount_all")}</SelectItem>
              <SelectItem value="with">{t("discount_with")}</SelectItem>
            </SelectContent>
          </Select>

          {/* Reviews */}
          <Select
            value={filters.minReview}
            onValueChange={(value: ProductFilters["minReview"]) =>
              setFilters((prev) => ({ ...prev, minReview: value }))
            }
          >
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
            value={filters.minStock}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, minStock: e.target.value }))
            }
          />
        </div>

        {/* Actions */}
        <div
          className={`mt-4 flex ${
            locale === "en" ? "justify-end" : "justify-start"
          } gap-2 border-t pt-4`}
        >
          <Button variant="outline" onClick={() => setFilters(INITIAL_FILTERS)}>
            {t("reset")}
          </Button>
          <Button>{t("apply")}</Button>
        </div>
      </CardContent>
    </Card>
  );
}

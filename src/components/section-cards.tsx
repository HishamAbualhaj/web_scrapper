import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Package, Store, TrendingUp, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
export function SectionCards() {
  const t = useTranslations('cards');
  const stats = [
    {
      title: t("Total Products"),
      value: "8",
      icon: <Package className="h-5 w-5" />,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: t("Total Stores"),
      value: "80",
      icon: <Store className="h-5 w-5" />,
      color: "text-chart-3",
      bgColor: "bg-chart-3/10",
    },
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="border-border py-0">
          <CardContent className="p-4">
            <div className={cn("flex items-center gap-4")}>
              <div className={cn("p-3 rounded-lg", stat.bgColor, stat.color)}>
                {stat.icon}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold text-foreground">
                  {stat.value}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

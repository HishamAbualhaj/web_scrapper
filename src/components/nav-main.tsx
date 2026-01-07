"use client";

import { IconCirclePlusFilled, type Icon } from "@tabler/icons-react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ChartColumnDecreasing } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: Icon;
    isActive: boolean;
  }[];
}) {
  const t = useTranslations("sidebar");

  const pathname = usePathname();
  const segment = pathname.split("/")[3];
  const isAnalyticsActive = !segment;

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <Link className="w-full" href={`/${pathname.split("/")[1]}/dashboard`}>
              <SidebarMenuButton
                tooltip="Quick Create"
                className={`text-gray-900 py-5 ${
                  isAnalyticsActive && "bg-primary"
                } font-bold hover:bg-primary/90 hover:text-primary-foreground dark:text-white! active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear`}
              >
                <ChartColumnDecreasing />
                <span>{t("analytics")}</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <Link href={item.url}>
                <SidebarMenuButton
                  className={`text-gray-900 py-5 ${
                    item.isActive && "bg-primary"
                  } font-bold hover:bg-primary/90 hover:text-primary-foreground dark:text-white! active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear`}
                  tooltip={item.title}
                >
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

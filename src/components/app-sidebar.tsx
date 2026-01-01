"use client";

import * as React from "react";
import {
  IconDashboard,
  IconInnerShadowTop,
  IconListDetails,
} from "@tabler/icons-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@radix-ui/react-tooltip";
import { Button } from "./ui/button";
import { Languages } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const t = useTranslations();
  const sidebar = useTranslations("sidebar");

  const pathname = usePathname();
  const segments = pathname.split("/");
  const localeItem = segments[1];
  const section = segments[3] ?? "analytics";

  const dashboardBase = `/${localeItem}/dashboard`;

  const data = {
    user: {
      name: "shadcn",
      email: "m@example.com",
      avatar: "/avatars/shadcn.jpg",
    },
    navMain: [
      {
        title: sidebar("stores"),
        url: `${dashboardBase}/stores`,
        icon: IconDashboard,
        isActive: section === "stores",
      },
      {
        title: sidebar("products"),
        url: `${dashboardBase}/products`,
        icon: IconListDetails,
        isActive: section === "products",
      },
    ],
  };
  const collapsed = useIsMobile();

  const router = useRouter();
  const locale = useLocale();
  const isRTL = locale === "ar";

  const toggleLanguage = () => {
    const nextLocale = locale === "en" ? "ar" : "en";

    const newPath = pathname.replace(`/${locale}`, `/${nextLocale}`);

    router.push(newPath);
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="#">
                <IconInnerShadowTop className="size-5!" />
                <span className="text-base font-semibold">
                  {t("dashboard")}
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size={collapsed ? "icon" : "default"}
              onClick={toggleLanguage}
              className={cn(
                "text-sidebar-foreground hover:bg-sidebar-accent",
                collapsed ? "w-10 h-10" : "w-full justify-start gap-3"
              )}
            >
              <Languages className="h-5 w-5" />
              {!collapsed && (
                <span>{locale === "en" ? "العربية" : "English"}</span>
              )}
            </Button>
          </TooltipTrigger>
          {collapsed && (
            <TooltipContent side={isRTL ? "left" : "right"}>
              {locale === "en" ? "العربية" : "English"}
            </TooltipContent>
          )}
        </Tooltip>
      </SidebarFooter>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}

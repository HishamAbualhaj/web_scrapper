"use client";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DirectionProvider } from "@radix-ui/react-direction";
import { useLocale } from "next-intl";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const locale = useLocale();

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar side={locale === "en" ? "left" : "right"} variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <DirectionProvider dir={locale === "ar" ? "rtl" : "ltr"}>
          <div className="p-10">{children}</div>
        </DirectionProvider>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default DashboardLayout;

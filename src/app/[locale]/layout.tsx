import type { Metadata } from "next";
import { Cairo, Montserrat } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { localeDirection, locales } from "@/i18n";

import "./globals.css";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Dashboard management for products",
};
const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-cairo",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-montserrat",
});

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: "en" | "ar" }>;
}>) {


  const locale = (await params).locale;
  const dir = localeDirection[locale];
  return (
    <html lang={locale} dir={dir}>
      <body className={`${cairo.variable} ${montserrat.variable}`}>
        <NextIntlClientProvider>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

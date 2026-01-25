import type { Metadata } from "next";
import { Cairo, Montserrat } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { localeDirection } from "@/i18n";
import "@/styles/globals.css";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { ScrapeProvider } from "@/context/ScrapeContext";
import ScrapeProgressUI from "@/components/scrape/ScrapeProgressUI";
import ClientProviders from "@/lib/QueryClientProvider";
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
  params: Promise<{ locale: string }>;
}>) {
  const locale = (await params).locale;
  const dir = localeDirection[locale];
  return (
    <html lang={locale} dir={dir}>
      <body className={`${cairo.variable} ${montserrat.variable}`}>
        <NuqsAdapter>
          <ClientProviders>
            <NextIntlClientProvider>
              <ScrapeProvider>
                {children}
                <ScrapeProgressUI />
              </ScrapeProvider>
            </NextIntlClientProvider>
          </ClientProviders>
        </NuqsAdapter>
      </body>
    </html>
  );
}

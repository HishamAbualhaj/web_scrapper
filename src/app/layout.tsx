import type { Metadata } from "next";
import { Cairo, Montserrat } from "next/font/google";

import "./globals.css";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isArabic = false;
  return (
    <html lang="en" className="dark">
      <body
        className={`antialiased ${
          isArabic ? cairo.className : montserrat.className
        }`}
      >
        {children}
      </body>
    </html>
  );
}

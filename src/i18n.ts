export const locales = ["en", "ar"] as const
export const defaultLocale = "ar"

export const localeDirection: Record<string, "ltr" | "rtl"> = {
  en: "ltr",
  ar: "rtl",
}

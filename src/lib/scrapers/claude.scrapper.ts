import scrapeAllPages from "../helpers/scrapeAllPages";

export default async function main(url: string) {
  let products: ProductDetails[] = [];

  try {
    products = await scrapeAllPages({
      url,
      maxRetries: 3,
      retryDelay: 1000,
    });
  } catch (error) {
    console.error(`\n❌ Error scraping ${url}:`, error);
  }

  return products;
}

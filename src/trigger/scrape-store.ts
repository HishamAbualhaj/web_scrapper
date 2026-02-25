import { task, logger } from "@trigger.dev/sdk";

export const scrapeStoreTask = task({
  id: "scrape-store",
  // Retry up to 3 times if scrapper.do fails
  retry: {
    maxAttempts: 3,
    minTimeoutInMs: 5000,
    factor: 2,
  },
  run: async (payload: { storeId: string; storeUrl: string }) => {
    const { storeId, storeUrl } = payload;

    logger.log("Starting scrape", { storeId, storeUrl });

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/scrapeDataBackground`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.CRON_SECRET}`,
        },
        body: JSON.stringify({ storeUrl }),
      },
    );

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Scrape failed [${res.status}]: ${text}`);
    }

    const result = await res.json();
    logger.log("Scrape complete", { storeId, result });

    return { storeId, success: true };
  },
});

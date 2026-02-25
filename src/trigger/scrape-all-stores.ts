import { schedules, logger } from "@trigger.dev/sdk";

import { scrapeStoreTask } from "./scrape-store";
import { supabase } from "@/supabase";

export const scrapeAllStores = schedules.task({
  id: "scrape-all-stores",
  cron: "0 0 */2 * *",
  run: async () => {
    const { data: stores, error } = await supabase
      .from("stores")
      .select("id, store_url")
      .not("store_url", "is", null);

    if (error || !stores) {
      throw new Error(`Failed to fetch stores: ${error?.message}`);
    }

    logger.log(`Found ${stores.length} stores to scrape`);

    // Process in chunks of 5 — scrapper.do free plan limit
    const CONCURRENCY = 5;
    const results = [];

    for (let i = 0; i < stores.length; i += CONCURRENCY) {
      const chunk = stores.slice(i, i + CONCURRENCY);

      logger.log(`Processing chunk ${Math.floor(i / CONCURRENCY) + 1}`, {
        stores: chunk.map((s) => s.id),
      });

      // All 5 run in parallel, wait for ALL to finish before next chunk
      const chunkResults = await Promise.allSettled(
        chunk.map((store) =>
          scrapeStoreTask.triggerAndWait({
            storeId: store.id,
            storeUrl: store.store_url,
          }),
        ),
      );

      results.push(...chunkResults);

      // Small buffer between chunks so scrapper.do doesn't spike
      if (i + CONCURRENCY < stores.length) {
        await new Promise((r) => setTimeout(r, 2000));
      }
    }

    const succeeded = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    logger.log("All stores processed", {
      succeeded,
      failed,
      total: stores.length,
    });

    return { succeeded, failed, total: stores.length };
  },
});

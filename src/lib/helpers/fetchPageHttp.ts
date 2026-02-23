async function fetchPage(url: string): Promise<string> {
  const tokens = [
    process.env.SCRAPE_DO_TOKEN,
    process.env.SCRAPE_DO_TOKEN_2,
  ].filter(Boolean);

  if (!tokens.length) {
    throw new Error("No scrape.do tokens configured");
  }

  let lastError: unknown;

  for (const token of tokens) {
    try {
      const apiUrl = `https://api.scrape.do/?url=${encodeURIComponent(url)}&token=${token}`;
      const response = await fetch(apiUrl, {
        cache: "no-store",
      });

      if (response.ok) {
        return await response.text();
      }

      lastError = new Error(`HTTP ${response.status}`);
    } catch (err) {
      lastError = err;
    }

    console.log("Trying next scrape.do token...");
  }

  throw new Error(`scrape.do failed: ${String(lastError)}`);
}

export default fetchPage;
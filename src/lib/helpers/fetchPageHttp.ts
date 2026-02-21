async function fetchPage(url: string): Promise<string> {
  const TOKEN = process.env.NEXT_PUBLIC_SCRAPE_DO_TOKEN

  const apiUrl = `http://api.scrape.do/?url=${encodeURIComponent(url)}&token=${TOKEN}`;

  const response = await fetch(apiUrl);

  if (!response.ok) {
    throw new Error(`scrape.do error: HTTP ${response.status}`);
  }

  return response.text();
}

export default fetchPage;

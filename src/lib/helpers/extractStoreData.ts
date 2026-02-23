import extractText from "./extractText";

function extractStoreData(link: string, html: string): (string | null)[] {
  const storeNameRegex = /<title>(.*?)<\/title>/i;
  const storeFullName = extractText(html, storeNameRegex);

  const storeName = extractText(storeFullName || "", /^(.*?)\s*\|/);


  const url = new URL(link);
  const match = url.pathname.match(/p-\d+/);
  const storeId = match?.[0] ?? null;

  return [storeId, storeName];
}

export default extractStoreData;

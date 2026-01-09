import cleanText from "./cleanText";
import extractAllMatches from "./extractAllMatches";
import extractText from "./extractText";
function extractProductFromBox(productBox: string): ProductDetails | null {
  try {
    // Extract Product ID,
    const hrefPattern = /href="([^"]*)"/;
    const productUrlPath = extractText(productBox, hrefPattern);

    // Extract product ID (format: N70035206V)
    let productId = "";
    let productUrl = undefined;

    // Validate this is a product URL (not pagination)
    if (
      productUrlPath &&
      !productUrlPath.includes("?page=") &&
      productUrlPath.includes("/p")
    ) {
      const idPattern = /\/(N\d+[A-Z]+)\//;
      const idMatch = productUrlPath.match(idPattern);
      productId = idMatch ? idMatch[1] : "";
      productUrl = productUrlPath.startsWith("http")
        ? productUrlPath
        : `https://www.noon.com${productUrlPath}`;
    } else {
      // Try to find product link more carefully
      const productLinkPattern = /href="(\/[^"]*\/N\d+[A-Z]+\/p[^"]*)"/;
      const productLinkMatch = productBox.match(productLinkPattern);

      if (productLinkMatch) {
        const validPath = productLinkMatch[1];
        const idPattern = /\/(N\d+[A-Z]+)\//;
        const idMatch = validPath.match(idPattern);
        productId = idMatch ? idMatch[1] : "";
        productUrl = `https://www.noon.com${validPath}`;
      }
    }

    // Extract title
    const titlePattern = /data-qa="plp-product-box-name"[^>]*title="([^"]*)"/;
    const title = extractText(productBox, titlePattern);

    if (!title) {
      return null;
    }

    // Extract price
    const pricePattern =
      /<strong class="[^"]*Price[^"]*amount[^"]*">([^<]*)<\/strong>/;
    const price = extractText(productBox, pricePattern);

    // Extract original price
    const originalPricePattern =
      /<span class="[^"]*oldPrice[^"]*">([^<]*)<\/span>/;
    const originalPrice = extractText(productBox, originalPricePattern);

    // Calculate discount
    let discount = null;
    if (price && originalPrice) {
      const priceNum = parseFloat(price.replace(/,/g, ""));
      const originalNum = parseFloat(originalPrice.replace(/,/g, ""));
      if (!isNaN(priceNum) && !isNaN(originalNum) && originalNum > priceNum) {
        discount = `${Math.round(
          ((originalNum - priceNum) / originalNum) * 100
        )}%`;
      }
    }

    // Extract rating
    // ✅ Rating
    const ratingPattern =
      /<div class="RatingPreviewStar-module-scss-module__[^"]*__textCtr">([^<]*)<\/div>/;
    const rating = extractText(productBox, ratingPattern);

    // Extract review count
    const reviewCountPattern =
      /<div class="[^"]*countCtr[^"]*">[\s\S]*?<span>([^<]+)<\/span>/;
    const reviewCount = extractText(productBox, reviewCountPattern);

    // Extract images - support both old and new formats
    const images: string[] = [];

    // Pattern 1: New format (pnsku)
    const imagePattern1 =
      /<img[^>]+src="(https:\/\/f\.nooncdn\.com\/p\/pnsku\/[^"]+\.jpg[^"]*)"/g;
    let imgMatch;
    while ((imgMatch = imagePattern1.exec(productBox)) !== null) {
      if (!images.includes(imgMatch[1])) {
        images.push(imgMatch[1]);
      }
    }

    // Pattern 2: Old format (v1234567/N12345_1.jpg)
    if (images.length === 0) {
      const imagePattern2 =
        /<img[^>]+src="(https:\/\/f\.nooncdn\.com\/p\/v\d+\/N\d+[A-Z]+_\d+\.jpg[^"]*)"/g;
      while ((imgMatch = imagePattern2.exec(productBox)) !== null) {
        if (!images.includes(imgMatch[1])) {
          images.push(imgMatch[1]);
        }
      }
    }

    // Pattern 3: Any noon image
    if (images.length === 0) {
      const imagePattern3 =
        /<img[^>]+src="(https:\/\/f\.nooncdn\.com\/p\/[^"]+\.jpg[^"]*)"/g;
      while ((imgMatch = imagePattern3.exec(productBox)) !== null) {
        if (!images.includes(imgMatch[1])) {
          images.push(imgMatch[1]);
        }
      }
    }

    // Extract badge
    const badgePattern =
      /<span class="[^"]*BestSellerTag[^"]*text[^"]*">([^<]*)<\/span>/;
    const badge = extractText(productBox, badgePattern);

    // Extract all nudges
    const nudgePattern = /<div class="[^"]*nudgeText[^"]*">([^<]*)<\/div>/g;
    const nudges = extractAllMatches(productBox, nudgePattern).filter(
      (nudge, index, self) => self.indexOf(nudge) === index
    );

    // Extract stock info
    const stockInfo = nudges.find(
      (nudge) => nudge.includes("المخزون") || nudge.includes("وحد")
    );

    return {
      storeId: "",
      storeName: "",
      productId: productId,
      title: cleanText(title),
      price: price || "N/A",
      originalPrice: originalPrice || "",
      discount: discount || "",
      rating: rating || "",
      reviewCount: reviewCount || "",
      images: images,
      productUrl: productUrl,
      badge: badge || "",
      nudges: nudges,
      stockInfo: stockInfo || "",
    };
  } catch (error) {
    console.error("Error extracting product from box:", error);
    return null;
  }
}
export default extractProductFromBox;

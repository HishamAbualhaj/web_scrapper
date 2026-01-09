import extractProductFromBox from "./extractProductFromBox";
import extractStoreData from "./extractStoreData";

function extractAllProducts(html: string, url: string): ProductDetails[] {
  const products: ProductDetails[] = [];

  console.log("\n🔍 Searching for product grid...");

  // First, find the grid container with data-qa="plp-grid"
  const gridPattern =
    /<div[^>]*data-qa="plp-grid"[^>]*>([\s\S]*?)(?:<\/div>\s*<\/div>\s*<div class="(?:Pagination|Footer)|$)/;
  const gridMatch = html.match(gridPattern);

  if (!gridMatch) {
    console.log('❌ Could not find product grid with data-qa="plp-grid"');
    return products;
  }

  const gridHtml = gridMatch[1];
  console.log(
    `✅ Found product grid (${Math.round(gridHtml.length / 1024)}KB)`
  );

  const [storeId, storeName] = extractStoreData(url, html);

  // Now split products within the grid by ProductBoxVertical wrapper
  const productBoxRegex =
    /<div class="ProductBoxVertical-module-scss-module__NG8XsG__wrapper[^"]*">/g;
  const parts = gridHtml.split(productBoxRegex);

  console.log(`📦 Found ${parts.length - 1} product containers in grid`);

  // Process each part (skip first as it's before the first product)
  for (let i = 1; i < parts.length; i++) {
    let productHtml = parts[i];

    // Find the end of this product box
    const endMarker = productHtml.indexOf(
      '<div class="ProductBoxVertical-module-scss-module__NG8XsG__wrapper'
    );
    if (endMarker > 0) {
      productHtml = productHtml.substring(0, endMarker);
    }

    // Enable debug for first and last product
    const isDebug = i === 1 || i === parts.length - 1;

    if (isDebug) {
      console.log(
        `\n🔍 Processing product ${i}/${parts.length - 1} (${
          productHtml.length
        } chars)`
      );
    }

    const product = extractProductFromBox(productHtml);

    if (product && storeId && storeName) {
      const productWithStoreData: ProductDetails = {
        ...product,
        storeId,
        storeName,
      };

      // Validate product has minimum required data
      if (product.productId && product.title) {
        products.push(productWithStoreData);
      }
    } else {
      console.log(`\n❌ Product ${i} extraction failed`);
    }
  }

  console.log(
    `\n✅ Successfully extracted ${products.length} products from grid\n`
  );

  return products;
}

export default extractAllProducts;

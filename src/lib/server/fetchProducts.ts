import { DataTableFilters } from "@/types/products";

function fetchProducts(
  page: number,
  limit: number,
  filters?: DataTableFilters,
): string {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  // Add filters if provided
  if (filters?.store) params.append("store", filters.store);
  if (filters?.name) params.append("name", filters.name);
  if (filters?.badge) params.append("badge", filters.badge);
  if (filters?.discount) params.append("discount", filters.discount);
  if (filters?.min) params.append("min", filters.min.toString());
  if (filters?.max) params.append("max", filters.max.toString());
  if (filters?.stock) params.append("stock", filters.stock.toString());

  const apiUrl = `/api/getAllProducts?${params.toString()}`;

  return apiUrl;
}
export default fetchProducts;

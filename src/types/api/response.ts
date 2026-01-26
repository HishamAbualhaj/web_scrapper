export interface getProductsResponse {
  product_id: string;
  store_id: string;
  title: string;
  external_product_id: string;
}
export type Store = {
  store_id: string;
  store_name: string;
  products_count: number;
  created_at: string;
};

type ProductPricePoint = { date: string; price: number };
export interface ProductAnalytics {
  id: string;
  product_id: string;
  title: string;
  prices: ProductPricePoint[];
}

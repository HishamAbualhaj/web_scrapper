export interface DataTableFilters {
  store?: string;
  name?: string;
  badge?: string;
  discount?: "with" | "without";
  min?: number;
  max?: number;
  stock?: number;
}

"use client";

import { useLocale, useTranslations } from "next-intl";
import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { z } from "zod";
import { TrendingDown, TrendingUp, Loader2 } from "lucide-react";
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useApiQuery } from "@/hooks/useApiQuery";
import { parseAsInteger, useQueryState } from "nuqs";
import { cn } from "@/lib/utils";

// ─── Schema ───────────────────────────────────────────────────────────────────

export const priceChangeSchema = z.object({
  product_id: z.string().uuid(),
  title: z.string(),
  store_id: z.string().uuid(),
  store_name: z.string(),
  previous_price: z.number(),
  current_price: z.number(),
  price_diff: z.number(),
  change_percentage: z.number(),
  recorded_at: z.string(),
});

export type PriceChange = z.infer<typeof priceChangeSchema>;

interface PriceChangesResponse {
  data: PriceChange[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    total: number;
  };
}

// ─── Price Change Badge ───────────────────────────────────────────────────────

function PriceChangeBadge({ changePercentage }: { changePercentage: number }) {
  const isPriceDrop = changePercentage > 0;
  return (
    <div
      className={cn(
        "flex items-center gap-1 font-semibold text-sm",
        isPriceDrop
          ? "text-red-600 dark:text-red-400"
          : "text-green-600 dark:text-green-400",
      )}
    >
      {isPriceDrop ? (
        <TrendingDown className="size-4 shrink-0" />
      ) : (
        <TrendingUp className="size-4 shrink-0" />
      )}
      <span>
        {isPriceDrop ? "-" : "+"}
        {Math.abs(changePercentage).toFixed(2)}%
      </span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PriceChangesTable() {
  const [pageParam, setPageParam] = useQueryState(
    "pc_page",
    parseAsInteger.withDefault(1),
  );
  const [limitParam, setLimitParam] = useQueryState(
    "pc_limit",
    parseAsInteger.withDefault(10),
  );

  // Shared store param — written by SelectStore, read here for filtering
  const [urlStore] = useQueryState("store");

  // Written here only — SelectionData reads and owns the analytics fetch
  const [product, setProduct] = useQueryState("product");
  const [, setStore] = useQueryState("store");

  const t = useTranslations();
  const locale = useLocale();

  // ── Columns — memoized so table doesn't fully reconcile on every render ───

  const columns = React.useMemo<ColumnDef<PriceChange>[]>(
    () => [
      {
        accessorKey: "store_name",
        header: () => t("priceChanges.table.storeName"),
        cell: ({ row }) => (
          <span className="font-medium">{row.original.store_name}</span>
        ),
      },
      {
        accessorKey: "title",
        header: () => t("priceChanges.table.product"),
        cell: ({ row }) => (
          <div className="max-w-52 text-wrap font-medium">
            {row.original.title}
          </div>
        ),
      },
      {
        accessorKey: "previous_price",
        header: () => t("priceChanges.table.previousPrice"),
        cell: ({ row }) => (
          <span className="tabular-nums">
            {row.original.previous_price.toFixed(2)}
          </span>
        ),
      },
      {
        accessorKey: "current_price",
        header: () => t("priceChanges.table.currentPrice"),
        cell: ({ row }) => (
          <span className="tabular-nums font-semibold">
            {row.original.current_price.toFixed(2)}
          </span>
        ),
      },
      {
        accessorKey: "price_diff",
        header: () => t("priceChanges.table.priceDiff"),
        cell: ({ row }) => (
          <span className="tabular-nums">
            {row.original.price_diff.toFixed(2)}
          </span>
        ),
      },
      {
        accessorKey: "change_percentage",
        header: () => t("priceChanges.table.changePercentage"),
        cell: ({ row }) => (
          <PriceChangeBadge changePercentage={row.original.change_percentage} />
        ),
      },
      {
        accessorKey: "recorded_at",
        header: () => t("priceChanges.table.recordedAt"),
        cell: ({ row }) => (
          <span className="text-muted-foreground text-sm tabular-nums">
            {new Date(row.original.recorded_at).toLocaleDateString(locale, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
        ),
      },
    ],
    // t and locale are stable references — safe deps
    [t, locale],
  );

  // ── Table state ───────────────────────────────────────────────────────────

  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);

  // ── Fetch price changes ───────────────────────────────────────────────────

  const apiUrl = React.useMemo(() => {
    const params = new URLSearchParams({
      page: String(pageParam),
      limit: String(limitParam),
    });
    if (urlStore && urlStore !== "all" && urlStore !== "noStore") {
      params.set("store_id", urlStore);
    }
    return `/api/priceChanges?${params.toString()}`;
  }, [pageParam, limitParam, urlStore]);

  const { data: apiResponse, isLoading } = useApiQuery<PriceChangesResponse>(
    ["price-changes", pageParam, limitParam, urlStore],
    { apiUrl, method: "GET" },
    // ✅ Keep previous data visible while next page loads — prevents layout jump
    { placeholderData: (prev) => prev },
  );


  const tableData = apiResponse?.data ?? [];
  const totalPages = apiResponse?.pagination.totalPages ?? 1;

  // ── Table instance ────────────────────────────────────────────────────────

  const table = useReactTable({
    data: tableData,
    columns,
    state: { sorting, columnVisibility, columnFilters },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleRowClick = (row: PriceChange) => {
    setProduct(row.product_id);
    setStore(row.store_id);
  };

  const handlePageChange = (newPage: number) => setPageParam(newPage);

  const handleLimitChange = (newLimit: number) => {
    setLimitParam(newLimit);
    setPageParam(1);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Legend */}
      <div className="flex items-center justify-end gap-4 text-sm">
        <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
          <TrendingDown className="size-4" />
          {t("priceChanges.legend.dropped")}
        </span>
        <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
          <TrendingUp className="size-4" />
          {t("priceChanges.legend.increased")}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border relative">
        <Table dir={locale === "en" ? "ltr" : "rtl"}>
          <TableHeader className="bg-muted sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    className={locale === "en" ? "text-left" : "text-right"}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => {
                const isPriceDrop = row.original.change_percentage > 0;
                const isSelected = product === row.original.product_id;
                return (
                  <TableRow
                    key={row.id}
                    onClick={() => handleRowClick(row.original)}
                    className={cn(
                      "cursor-pointer transition-colors",
                      isPriceDrop
                        ? "bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/30"
                        : "bg-green-50 hover:bg-green-100 dark:bg-green-950/20 dark:hover:bg-green-950/30",
                      isSelected && "ring-2 ring-inset ring-primary",
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            ) : isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-40 text-center"
                />
              </TableRow>
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-40 text-center"
                >
                  {t("table.NoResults")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {isLoading && (
          <div className="flex items-center justify-center gap-2 absolute bg-gray-200/50 z-10 left-0 top-0 w-full h-full">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">{t("state.loading")}</span>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4">
        <div className="flex w-full items-center gap-8 lg:w-fit">
          <div className="hidden items-center gap-2 lg:flex">
            <label htmlFor="pc-rows-per-page" className="text-sm font-medium">
              {t("table.rowsPerPage")}
            </label>
            <Select
              value={`${limitParam}`}
              onValueChange={(value) => handleLimitChange(Number(value))}
            >
              <SelectTrigger size="sm" className="w-20" id="pc-rows-per-page">
                <SelectValue placeholder={`${limitParam}`} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex w-fit items-center justify-center text-sm font-medium">
            {t("table.page")} {pageParam} {t("table.of")}{" "}
            {isLoading ? (
              <Loader2 className="h-3 w-3 mx-2 animate-spin" />
            ) : (
              totalPages
            )}
          </div>

          <div dir="ltr" className="ml-auto flex items-center gap-2 lg:ml-0">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => handlePageChange(1)}
              disabled={pageParam === 1 || isLoading}
            >
              <span className="sr-only">{t("table.goFirst")}</span>
              <IconChevronsLeft />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => handlePageChange(Math.max(pageParam - 1, 1))}
              disabled={pageParam === 1 || isLoading}
            >
              <span className="sr-only">{t("table.goPrev")}</span>
              <IconChevronLeft />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => handlePageChange(pageParam + 1)}
              disabled={pageParam >= totalPages || isLoading}
            >
              <span className="sr-only">{t("table.goNext")}</span>
              <IconChevronRight />
            </Button>
            <Button
              variant="outline"
              className="hidden size-8 lg:flex"
              size="icon"
              onClick={() => handlePageChange(totalPages)}
              disabled={pageParam >= totalPages || isLoading}
            >
              <span className="sr-only">{t("table.goLast")}</span>
              <IconChevronsRight />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

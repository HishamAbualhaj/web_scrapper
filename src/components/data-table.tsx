"use client";

import { useLocale, useTranslations } from "next-intl";

import * as React from "react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconDotsVertical,
  IconGripVertical,
} from "@tabler/icons-react";
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type Row,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { z } from "zod";

import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
import { Tabs, TabsContent } from "@/components/ui/tabs";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";
import { Card, CardContent } from "./ui/card";
import Link from "next/link";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { useApiQuery } from "@/hooks/useApiQuery";
import { getAllProductsResponse } from "@/types/api/response";
import fetchProducts from "@/lib/server/fetchProducts";
import { DataTableFilters } from "@/types/products";
import { Loader2 } from "lucide-react";
import { parseAsInteger, useQueryState } from "nuqs";

export const schema = z.object({
  product_id: z.string().uuid(),
  store_id: z.string().uuid(),
  title: z.string(),
  store_title: z.string(),

  price: z.number(),
  original_price: z.number(),
  discount: z.number(),

  rating: z.number(),
  review_count: z.number(),

  images: z.array(z.string().url()),
  nudges: z.array(z.string()),

  product_url: z.string().url(),

  badge: z.string().nullable(),
  stock_info: z.string().nullable(),
  extracted_stock: z.number().nullable(),

  external_product_id: z.string(),

  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

// Create a separate component for the drag handle
function DragHandle({ id }: { id: string }) {
  const { attributes, listeners } = useSortable({
    id,
  });

  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="text-muted-foreground size-7 hover:bg-transparent"
    >
      <IconGripVertical className="text-muted-foreground size-3" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  );
}

function DraggableRow({ row }: { row: Row<z.infer<typeof schema>> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.product_id,
  });

  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
}

export function DataTable({ filters }: { filters?: DataTableFilters }) {
  const [pageParam, setPageParam] = useQueryState(
    "page",
    parseAsInteger.withDefault(1),
  );
  const [limitParam, setLimitParam] = useQueryState(
    "limit",
    parseAsInteger.withDefault(10),
  );

  const [open, setOpen] = React.useState<boolean>(false);
  const [productName, setProductName] = React.useState<string>("");
  const columns: ColumnDef<z.infer<typeof schema>>[] = [
    {
      id: "drag",
      header: () => null,
      cell: ({ row }) => <DragHandle id={row.original.product_id} />,
    },
    {
      accessorKey: "storetitle",
      header: ({ table }) => table.options.meta?.t?.("table.storetitle"),
      cell: ({ row }) => row.original.store_title,
      enableHiding: false,
    },
    {
      accessorKey: "title",
      header: ({ table }) => table.options.meta?.t?.("table.title"),
      cell: ({ row }) => (
        <div className="max-w-55 line-clamp-1">
          <TableCellViewer item={row.original} />
        </div>
      ),
      enableHiding: false,
    },

    {
      accessorKey: "price",
      header: ({ table }) => table.options.meta?.t?.("table.price"),
      cell: ({ row }) => row.original.price,
    },

    {
      accessorKey: "oldPrice",
      header: ({ table }) => table.options.meta?.t?.("table.oldPrice"),
      cell: ({ row }) => row.original.original_price,
    },

    {
      accessorKey: "discount",
      header: ({ table }) => table.options.meta?.t?.("table.discount"),
      cell: ({ row }) => row.original.discount,
    },

    {
      accessorKey: "rating",
      header: ({ table }) => table.options.meta?.t?.("table.rating"),
      cell: ({ row }) => row.original.rating,
    },

    {
      accessorKey: "stock",
      header: ({ table }) => table.options.meta?.t?.("table.stock"),
      cell: ({ row, table }) =>
        row.original.stock_info ? (
          row.original.stock_info
        ) : (
          <div className="text-">
            {table.options.meta?.t?.("table.NotFound")}
          </div>
        ),
    },

    {
      accessorKey: "badge",
      header: ({ table }) => table.options.meta?.t?.("table.badge"),
      cell: ({ row, table }) => (
        <div className="flex gap-1 flex-wrap">
          {row.original.badge ? (
            <Badge variant="outline">{row.original.badge}</Badge>
          ) : (
            <div className="text-center">
              {table.options.meta?.t?.("table.NotFound")}
            </div>
          )}
        </div>
      ),
    },

    {
      id: "actions",
      cell: ({ row, table }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
              size="icon"
            >
              <IconDotsVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <Link
              href={`/dashboard?store=${row.original.store_id}&product=${row.original.product_id}`}
            >
              <DropdownMenuItem>
                {table.options.meta?.t?.("table.showAnalytics")}
              </DropdownMenuItem>
            </Link>

            <DropdownMenuItem
              onClick={() => {
                setOpen(true);
                setProductName(row.original.title);
              }}
              variant="destructive"
            >
              {table.options.meta?.t?.("actions.delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  // const [data, setData] = React.useState(() => initialData);
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const sortableId = React.useId();
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {}),
  );

  const t = useTranslations();

  // Fetch data with React Query
  const {
    data: apiResponse,
    isLoading,
    isFetching,
    isError,
    error,
  } = useApiQuery<getAllProductsResponse>(
    ["products", pageParam, limitParam, filters],
    {
      apiUrl: fetchProducts(pageParam, limitParam, filters),
      method: "GET",
    },
  );

  // Local state for drag and drop reordering
  const [localData, setLocalData] = React.useState<z.infer<typeof schema>[]>(
    [],
  );

  // Update local data when API data changes
  React.useEffect(() => {
    if (apiResponse?.data) {
      setLocalData(apiResponse.data);
    }
  }, [apiResponse?.data]);

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => localData?.map(({ product_id }) => product_id) || [],
    [localData],
  );

  const table = useReactTable({
    data: localData,
    columns,
    meta: {
      t,
    },
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.product_id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setLocalData((data) => {
        const oldIndex = dataIds.indexOf(active.id);
        const newIndex = dataIds.indexOf(over.id);
        return arrayMove(data, oldIndex, newIndex);
      });
    }
  }
  const locale = useLocale();

  // Pagination handlers
  const handlePageChange = (newPage: number) => {
    setPageParam(newPage);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimitParam(newLimit);
    setPageParam(1); // Reset to first page when changing limit
  };

  const totalPages = apiResponse?.pagination.totalPages || 1;

  return (
    <Tabs
      defaultValue="outline"
      className="w-full flex-col justify-start gap-6"
    >
      <DeleteDialog
        productName={productName}
        open={open}
        onOpenChange={setOpen}
      />
      <TabsContent
        value="outline"
        className="relative flex flex-col gap-4 overflow-auto"
      >
        <div className="overflow-hidden rounded-lg border relative">
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            id={sortableId}
          >
            <Table dir={locale === "en" ? "ltr" : "rtl"}>
              <TableHeader className="bg-muted sticky top-0 z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead
                          className={
                            locale === "en" ? "text-left" : "text-right"
                          }
                          key={header.id}
                          colSpan={header.colSpan}
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>

              <TableBody className="**:data-[slot=table-cell]:first:w-8">
                {table.getRowModel().rows?.length ? (
                  <SortableContext
                    items={dataIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {table.getRowModel().rows.map((row) => (
                      <DraggableRow key={row.id} row={row} />
                    ))}
                  </SortableContext>
                ) : isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-40 text-center"
                    ></TableCell>
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
          </DndContext>
          {isLoading && (
            <div className="flex items-center justify-center gap-2 absolute bg-gray-200/50 z-10 left-0 top-0 w-full h-full">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">{t("state.loading")}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-4">
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <label htmlFor="rows-per-page" className="text-sm font-medium">
                {t("table.rowsPerPage")}
              </label>
              <Select
                value={`${limitParam}`}
                onValueChange={(value) => handleLimitChange(Number(value))}
              >
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue placeholder={`${pagination.pageSize}`} />
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
      </TabsContent>
    </Tabs>
  );
}

function TableCellViewer({ item }: { item: z.infer<typeof schema> }) {
  const t = useTranslations();
  const locale = useLocale();
  const isMobile = useIsMobile();

  const isRTL = locale === "ar";
  return (
    <Drawer direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>
        <Button variant="link" className="text-foreground w-fit px-0 text-left">
          {item.title}
        </Button>
      </DrawerTrigger>

      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>{item.title}</DrawerTitle>
          <DrawerDescription>{t("Showing Product details")}</DrawerDescription>
        </DrawerHeader>

        {/* Carousel */}
        <div className="relative px-4">
          <Carousel
            className="w-full"
            opts={{
              direction: isRTL ? "rtl" : "ltr",
            }}
          >
            <CarouselContent>
              {item.images.map((i, index) => (
                <CarouselItem key={index}>
                  <Card>
                    <CardContent className="flex aspect-square items-center justify-center p-6">
                      <Image
                        src={i}
                        alt="Image product"
                        width={500}
                        height={500}
                      />
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>

            <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2" />
            <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2" />
          </Carousel>
        </div>

        <div className="flex gap-3 flex-wrap mt-5 px-5">
          {item.nudges.map((nudge) => (
            <Badge className="py-2! px-3!" variant="secondary" key={nudge}>
              {nudge}
            </Badge>
          ))}
        </div>

        <Link
          target="_blank"
          className="text-center mt-5 text-xl border py-4 mx-4 rounded-lg hover:bg-muted"
          href={item.product_url}
        >
          {t("table.productLink")}
        </Link>
      </DrawerContent>
    </Drawer>
  );
}

function DeleteDialog({
  productName,
  open,
  onOpenChange,
}: {
  productName: string;
  open: boolean;
  onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const t = useTranslations("products.delete");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTitle></DialogTitle>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogDescription className="font-bold">
            {t("description", { name: productName })}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">{t("cancel")}</Button>
          </DialogClose>
          <Button variant="destructive">{t("confirm")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

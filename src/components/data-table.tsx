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

export const schema = z.object({
  storeId: z.string(),
  storeName: z.string(),
  productId: z.string(),
  title: z.string(),
  originalPrice: z.string(),
  price: z.string(),
  discount: z.string(),
  rating: z.string(),
  reviewCount: z.string(),
  stockInfo: z.string(),
  images: z.array(z.string()),
  productUrl: z.string(),
  badge: z.string(),
  nudges: z.array(z.string()),
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
    id: row.original.productId,
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

export function DataTable({
  data: initialData,
}: {
  data: z.infer<typeof schema>[];
}) {
  const [open, setOpen] = React.useState<boolean>(false);
  const [productName, setProductName] = React.useState<string>("");
  const columns: ColumnDef<z.infer<typeof schema>>[] = [
    {
      id: "drag",
      header: () => null,
      cell: ({ row }) => <DragHandle id={row.original.productId} />,
    },
    {
      accessorKey: "storetitle",
      header: ({ table }) => table.options.meta?.t?.("table.storetitle"),
      cell: ({ row }) => row.original.storeName,
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
      cell: ({ row }) => row.original.originalPrice,
    },

    {
      accessorKey: "discount",
      header: ({ table }) => table.options.meta?.t?.("table.discount"),
      cell: ({ row }) => row.original.discount,
    },

    {
      accessorKey: "rating",
      header: ({ table }) => table.options.meta?.t?.("table.rating"),
      cell: ({ row }) => row.original.reviewCount,
    },

    {
      accessorKey: "stock",
      header: ({ table }) => table.options.meta?.t?.("table.stock"),
      cell: ({ row, table }) =>
        row.original.stockInfo ? (
          row.original.stockInfo
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
              href={`/dashboard?store=${row.original.storeId}&product=${row.original.productId}`}
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

  const [data, setData] = React.useState(() => initialData);
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
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
    useSensor(KeyboardSensor, {})
  );

  const t = useTranslations();
  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => data?.map(({ productId }) => productId) || [],
    [data]
  );

  const table = useReactTable({
    data,
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
    getRowId: (row) => row.productId.toString(),
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
      setData((data) => {
        const oldIndex = dataIds.indexOf(active.id);
        const newIndex = dataIds.indexOf(over.id);
        return arrayMove(data, oldIndex, newIndex);
      });
    }
  }
  const locale = useLocale();

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
        <div className="overflow-hidden rounded-lg border">
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
                                header.getContext()
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
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      {t("table.NoResults")}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>

        <div className="flex items-center justify-between px-4">
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <label htmlFor="rows-per-page" className="text-sm font-medium">
                {t("table.rowsPerPage")}
              </label>
              <Select
                value={`${pagination.pageSize}`}
                onValueChange={(value) =>
                  setPagination((prev) => ({
                    ...prev,
                    pageSize: Number(value),
                  }))
                }
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
              {t("table.page")} {pagination.pageIndex + 1} {t("table.of")}{" "}
              {Math.ceil(data.length / pagination.pageSize)}
            </div>

            <div dir="ltr" className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => setPagination((p) => ({ ...p, pageIndex: 0 }))}
                disabled={pagination.pageIndex === 0}
              >
                <span className="sr-only">{t("table.goFirst")}</span>
                <IconChevronsLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() =>
                  setPagination((p) => ({
                    ...p,
                    pageIndex: Math.max(p.pageIndex - 1, 0),
                  }))
                }
                disabled={pagination.pageIndex === 0}
              >
                <span className="sr-only">{t("table.goPrev")}</span>
                <IconChevronLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() =>
                  setPagination((p) => ({
                    ...p,
                    pageIndex: Math.min(
                      p.pageIndex + 1,
                      Math.ceil(data.length / pagination.pageSize) - 1
                    ),
                  }))
                }
                disabled={
                  pagination.pageIndex >=
                  Math.ceil(data.length / pagination.pageSize) - 1
                }
              >
                <span className="sr-only">{t("table.goNext")}</span>
                <IconChevronRight />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() =>
                  setPagination((p) => ({
                    ...p,
                    pageIndex: Math.ceil(data.length / pagination.pageSize) - 1,
                  }))
                }
                disabled={
                  pagination.pageIndex >=
                  Math.ceil(data.length / pagination.pageSize) - 1
                }
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

import type { ComponentProps, ReactNode } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TableSkeletonRows } from "@/shared/components/misc/table-skeleton-rows";
import { ErrorCard } from "@/shared/components/misc/error-card";
import { cn } from "@/shared/lib/utils";

export interface DataTableColumn {
  key: string;
  header: ReactNode;
  align?: "left" | "right";
  className?: string;
}

interface DataTableProps<T> {
  columns: DataTableColumn[];
  data: T[];
  getRowKey: (item: T, index: number) => string | number;
  renderCells: (item: T, index: number) => ReactNode;
  getRowProps?: (item: T, index: number) => ComponentProps<typeof TableRow>;
  isLoading?: boolean;
  loadingRows?: number;
  error?: Error | null;
  errorMessage?: string;
  emptyMessage?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  getRowKey,
  renderCells,
  getRowProps,
  isLoading = false,
  loadingRows = 4,
  error,
  errorMessage,
  emptyMessage = "No results found.",
  footer,
  className,
}: DataTableProps<T>) {
  if (error) return <ErrorCard message={errorMessage} />;

  return (
    <div className={cn("rounded-2xl border border-border/60 overflow-hidden", className)}>
      <Table>
        <TableHeader className="bg-secondary/40">
          <TableRow className="hover:bg-transparent border-none">
            {columns.map((col) => (
              <TableHead
                key={col.key}
                className={cn(
                  "h-auto py-3 font-semibold text-xs tracking-wider",
                  col.align === "right" && "text-right",
                  col.className,
                )}
              >
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-border/40">
          {isLoading ? (
            <TableSkeletonRows rows={loadingRows} cols={columns.length} />
          ) : data.length === 0 ? (
            <TableRow className="hover:bg-transparent border-none">
              <TableCell colSpan={columns.length} className="py-0">
                {typeof emptyMessage === "string" ? (
                  <p className="text-center text-muted-foreground text-sm py-10">{emptyMessage}</p>
                ) : (
                  emptyMessage
                )}
              </TableCell>
            </TableRow>
          ) : (
            data.map((item, i) => {
              const { className: rowClassName, ...rowProps } = getRowProps?.(item, i) ?? {};
              return (
                <TableRow
                  key={getRowKey(item, i)}
                  className={cn("hover:bg-secondary/20 transition-colors", rowClassName)}
                  {...rowProps}
                >
                  {renderCells(item, i)}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
      {footer}
    </div>
  );
}

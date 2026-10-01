import Skeleton from "@/components/elements/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface DataTableSkeletonProps {
  columnCount?: number
  rowCount?: number
  searchable?: boolean
  filterable?: boolean
}

export function DataTableSkeleton({
  columnCount = 5,
  rowCount = 10,
  searchable = true,
  filterable = true,
}: DataTableSkeletonProps) {
  return (
    <div className="w-full space-y-4">
      {/* Header skeleton */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          {searchable && <Skeleton className="h-8 w-[180px]" />}
          {filterable && <Skeleton className="h-8 w-8 rounded-md" />}
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-[100px]" />
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </div>

      {/* Table skeleton */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Skeleton className="h-4 w-4" />
              </TableHead>
              {Array.from({ length: columnCount - 1 }).map((_, index) => (
                <TableHead key={index}>
                  <Skeleton className="h-4 w-[100px]" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rowCount }).map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                <TableCell>
                  <Skeleton className="h-4 w-4" />
                </TableCell>
                {Array.from({ length: columnCount - 2 }).map((_, colIndex) => (
                  <TableCell key={colIndex}>
                    <Skeleton className="h-4 w-[120px]" />
                  </TableCell>
                ))}
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <Skeleton className="h-8 w-8 rounded-md" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination skeleton */}
      <div className="flex items-center justify-between p-4">
        <Skeleton className="h-8 w-[200px]" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-[100px]" />
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </div>
    </div>
  )
}
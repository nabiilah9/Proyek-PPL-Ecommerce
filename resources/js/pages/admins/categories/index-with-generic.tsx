"use client"

import { toast } from "sonner"
import { useEffect, useState } from "react"
import { Head, usePage } from "@inertiajs/react"
import type { BreadcrumbItem, SharedData } from "@/types"

import { columns } from "./columns"
import { DataTable } from "@/components/ui/data-table"
import AppLayout from "@/components/layouts/app-layout"
import { DataTableSkeleton } from "@/components/fragments/data-table-skeleton"

interface Category {
  id: number
  name: string
  slug: string
  description?: string
  created_at: string
  updated_at: string
}

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: "Categories",
    href: "/categories",
  },
]

export default function Categories() {
  const { categories, success, error } = usePage<SharedData & { categories?: { data: Category[] } }>().props

  const [isLoading, setIsLoading] = useState(!categories)

  useEffect(() => {
    if (success) toast.success(success as string)
    if (error) toast.error(error as string)

    // Simulate loading for demo purposes if no categories
    if (!categories) {
      const timer = setTimeout(() => {
        setIsLoading(false)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [success, error, categories])

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Categories" />
      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
        <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border md:min-h-min">
          {isLoading || !categories ? (
            <DataTableSkeleton columnCount={4} rowCount={8} searchable={true} filterable={true} />
          ) : (
            <DataTable<Category, string> columns={columns} data={categories.data} searchKey="name" create="category" />
          )}
        </div>
      </div>
    </AppLayout>
  )
}
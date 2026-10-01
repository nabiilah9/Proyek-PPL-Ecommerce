"use client"

import { toast } from "sonner"
import { useEffect, useState } from "react"
import { Head, usePage, router } from "@inertiajs/react"
import type { BreadcrumbItem, SharedData } from "@/types"
import { FolderTree } from "lucide-react"

import { columns } from "./columns"
import { DataTable } from "@/components/ui/data-table"
import AppLayout from "@/components/layouts/app-layout"
import { DataTableSkeleton } from "@/components/fragments/data-table-skeleton"
import HoldPattern from "@/components/fragments/hold-pattern"

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

  const handleCreateCategory = () => {
    router.visit("/categories/create")
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Categories" />
      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
        <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border md:min-h-min">
          {isLoading ? (
            <DataTableSkeleton columnCount={4} rowCount={8} searchable={true} filterable={true} />
          ) : categories && categories.data.length > 0 ? (
            <DataTable<Category, string> columns={columns} data={categories.data} searchKey="name" create="category" />
          ) : (
            <HoldPattern
              title="No categories found"
              description="You haven't created any categories yet. Categories help you organize your products."
              icon={<FolderTree className="h-10 w-10 text-muted-foreground" />}
              actionLabel="Create Category"
              onAction={handleCreateCategory}
            />
          )}
        </div>
      </div>
    </AppLayout>
  )
}
import { useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import { type BreadcrumbItem, type SharedData } from '@/types';

import { columns, type Item } from './columns';
import { DataTable } from '@/components/ui/data-table';
import AppLayout from '@/components/layouts/app-layout';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/admin' },
  { title: 'Produk', href: '/admin/items' },
];

export default function ProductsIndex() {
  const { items, success, error } = usePage<
    SharedData & { items: Item[] }
  >().props;

  useEffect(() => {
    if (success) toast.success(success as string);
    if (error) toast.error(error as string);
  }, [success, error]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Manajemen Produk" />
      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
        <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border md:min-h-min">
          <DataTable<Item, string>
            columns={columns}
            data={items}
            searchKey="name"
            create="item"
          />
        </div>
      </div>
    </AppLayout>
  );
}
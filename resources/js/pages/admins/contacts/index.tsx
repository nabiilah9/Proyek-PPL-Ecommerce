import { toast } from 'sonner';
import { useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { BreadcrumbItem, Contact, SharedData } from '@/types';

import { columns } from './columns';
import { DataTable } from '@/components/ui/data-table';
import AppLayout from '@/components/layouts/app-layout';

const breadcrumbs: BreadcrumbItem[] = [{
  title: 'Contacts',
  href: '/contacts',
}];

export default function Users() {
  const { contacts, success, error } = usePage<
    SharedData & { contacts: { data: Contact[] } }
  >().props;
  console.log(contacts);

  useEffect(() => {
    if (success) toast.success(success as string);
    if (error) toast.error(error as string);
  }, [success, error]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Contacts" />
      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
        <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border md:min-h-min">
          <DataTable<Contact, string>
            columns={columns}
            data={contacts.data}
            searchKey="name"
            create="contact"
          />
          {/* <BorderBeam size={300} duration={10} /> */}
        </div>
      </div>
    </AppLayout>
  );
};
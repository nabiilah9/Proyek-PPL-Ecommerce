import { toast } from 'sonner';
import { useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { BreadcrumbItem, SharedData, User } from '@/types';

// import { BorderBeam } from '@/components/ui/border-beam';
import { columns } from './columns';
import { DataTable } from '@/components/ui/data-table';
import AppLayout from '@/components/layouts/app-layout';

const breadcrumbs: BreadcrumbItem[] = [{
  title: 'Users',
  href: '/users',
}];

export default function Users() {
  const { users, success, error } = usePage<
    SharedData & { users: { data: User[] } }
  >().props;
  console.log(users);

  // const [ role, setRole ] = useState<User[]>([]);
  // const [ deleted_at, setDeleted_at ] = useState<User[]>([]);

  // const userFiltered = useCallback(() => {
  //   return users.data.filter(
  //     (users) => (
        
  //     )
  //   );
  // });

  useEffect(() => {
    if (success) toast.success(success as string);
    if (error) toast.error(error as string);
  }, [success, error]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Users" />
      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
        <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border md:min-h-min">
          <DataTable<User, string>
            columns={columns}
            data={users.data}
            searchKey="username"
            create="user"
          />
          {/* <BorderBeam size={300} duration={10} /> */}
        </div>
      </div>
    </AppLayout>
  );
};
import { useInitials } from '@/hooks/use-initials';
import { User } from '@/types';
import { ColumnDef } from '@tanstack/react-table';

import Checkbox from '@/components/elements/checkbox';
import { DataTableColumnHeader } from '@/components/templates/data-table-header';
import { DeleteModal } from '@/components/templates/delete-modal';
import { EditButton } from '@/components/templates/edit-button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export const columns: ColumnDef<User, string>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Select row" />,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'avatar',
    header: 'Avatar',
    cell: ({ row }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const getInitials = useInitials();
      return (
        <Avatar className="h-8 w-8 overflow-hidden rounded-full">
          <AvatarImage src={row.getValue('avatar')} alt={row.getValue('username')} />
          <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
            {getInitials(row.getValue('username'))}
          </AvatarFallback>
        </Avatar>
      );
    },
  },
  {
    accessorKey: 'username',
    header: ({ column }) => <DataTableColumnHeader<User, unknown> column={column} title="Username" />,
    cell: ({ row }) => <div>{row.getValue('username')}</div>,
  },
  {
    accessorKey: 'email',
    header: ({ column }) => <DataTableColumnHeader<User, unknown> column={column} title="Email" />,
    cell: ({ row }) => <div>{row.getValue('email')}</div>,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader<User, unknown> column={column} title="Status" />,
    cell: ({ row }) => <Badge variant={row.getValue('status') === 'active' ? 'default' : 'muted'}>{row.getValue('status')}</Badge>,
  },
  {
    accessorKey: 'role',
    header: ({ column }) => <DataTableColumnHeader<User, unknown> column={column} title="Role" />,
    cell: ({ row }) => {
      const role = row.getValue('role') as string;
      let variant: 'default' | 'ghost' | 'outline' | 'link' = 'default';
      switch (role) {
        case 'ADMIN':
          variant = 'link';
          break;
        case 'COURIER':
          variant = 'ghost';
          break;
        case 'CLIENT':
          variant = 'outline';
          break;
        default:
          variant = 'default';
          break;
      }
      return <Badge variant={variant}>{role}</Badge>;
    },
  },
  {
    accessorKey: 'deleted_at',
    header: ({ column }) => <DataTableColumnHeader<User, unknown> column={column} title="Deleted" />,
    cell: ({ row }) => {
      const deletedAt = row.getValue('deleted_at');
      if (!deletedAt) return null;

      return (
        <Badge variant="default" className="text-red-500">
          Deleted
        </Badge>
      );
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex gap-5">
          <EditButton endpoint="user" id={String(user.id)} />
          <DeleteModal resourceName="user" id={user.id} />
        </div>
      );
    },
  },
];

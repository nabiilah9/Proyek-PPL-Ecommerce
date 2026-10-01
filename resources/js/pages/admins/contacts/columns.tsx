import { Contact } from '@/types';
import { ColumnDef } from '@tanstack/react-table';

import Checkbox from '@/components/elements/checkbox';
import { DataTableColumnHeader } from '@/components/templates/data-table-header';
import { DeleteModal } from '@/components/templates/delete-modal';
import { EditButton } from '@/components/templates/edit-button';
import { Badge } from '@/components/ui/badge';

export const columns: ColumnDef<Contact, string>[] = [
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
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader<Contact, unknown> column={column} title="name" />,
    cell: ({ row }) => <div>{row.getValue('name')}</div>,
  },
  {
    accessorKey: 'phone',
    header: ({ column }) => <DataTableColumnHeader<Contact, unknown> column={column} title="phone" />,
    cell: ({ row }) => <div>{row.getValue('phone')}</div>,
  },
  {
    accessorKey: 'gender',
    header: ({ column }) => <DataTableColumnHeader<Contact, unknown> column={column} title="gender" />,
    cell: ({ row }) => <Badge variant={row.getValue('gender') === 'active' ? 'default' : 'muted'}>{row.getValue('gender')}</Badge>,
  },
  {
    accessorKey: 'birthday',
    header: ({ column }) => <DataTableColumnHeader<Contact, unknown> column={column} title="birthday" />,
    cell: ({ row }) => <div>{row.getValue('birthday')}</div>,
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

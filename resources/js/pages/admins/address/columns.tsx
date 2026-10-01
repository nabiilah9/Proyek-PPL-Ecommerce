import { Address } from '@/types';
import { ColumnDef } from '@tanstack/react-table';

import Checkbox from '@/components/elements/checkbox';
import { DataTableColumnHeader } from '@/components/templates/data-table-header';
import { DeleteModal } from '@/components/templates/delete-modal';
import { EditButton } from '@/components/templates/edit-button';

export const columns: ColumnDef<Address, string>[] = [
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
    accessorKey: 'post_code',
    header: ({ column }) => <DataTableColumnHeader<Address, unknown> column={column} title="post_code" />,
    cell: ({ row }) => <div>{row.getValue('post_code')}</div>,
  },
  {
    accessorKey: 'country',
    header: ({ column }) => <DataTableColumnHeader<Address, unknown> column={column} title="country" />,
    cell: ({ row }) => <div>{row.getValue('country')}</div>,
  },
  {
    accessorKey: 'province',
    header: ({ column }) => <DataTableColumnHeader<Address, unknown> column={column} title="province" />,
    cell: ({ row }) => <div>{row.getValue('province')}</div>,
  },
  {
    accessorKey: 'city',
    header: ({ column }) => <DataTableColumnHeader<Address, unknown> column={column} title="city" />,
    cell: ({ row }) => <div>{row.getValue('city')}</div>,
  },
  {
    accessorKey: 'street',
    header: ({ column }) => <DataTableColumnHeader<Address, unknown> column={column} title="street" />,
    cell: ({ row }) => <div>{row.getValue('street')}</div>,
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

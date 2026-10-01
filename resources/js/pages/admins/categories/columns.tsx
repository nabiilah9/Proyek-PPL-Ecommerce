import { User } from '@/types';
import { ColumnDef } from '@tanstack/react-table';

import Checkbox from '@/components/elements/checkbox';
import { DeleteModal } from '@/components/templates/delete-modal';
import { EditButton } from '@/components/templates/edit-button';

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
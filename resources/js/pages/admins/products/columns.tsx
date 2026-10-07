import { ColumnDef } from '@tanstack/react-table';
import Checkbox from '@/components/elements/checkbox';
import { DataTableColumnHeader } from '@/components/templates/data-table-header';
import { DeleteModal } from '@/components/templates/delete-modal';
import { EditButton } from '@/components/templates/edit-button';
import { Badge } from '@/components/ui/badge';

export interface Item {
  id: number;
  name: string;
  unit: string;
  price: number;
  stock: number;
  image_url: string;
  is_available: boolean;
  discount: number;
  description: string | null;
  expired_at: string | null;
  category?: { id: number; name: string };
}

export const columns: ColumnDef<Item, string>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'image_url',
    header: 'Gambar',
    cell: ({ row }) => {
      const url = row.getValue('image_url') as string;
      return url ? (
        <img src={url} alt={row.getValue('name')} className="h-12 w-12 rounded-md object-cover" />
      ) : (
        <div className="h-12 w-12 rounded-md bg-gray-100 flex items-center justify-center text-xs text-gray-400">
          No Img
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader<Item, unknown> column={column} title="Nama Produk" />,
    cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
  },
  {
    accessorKey: 'category',
    header: 'Kategori',
    cell: ({ row }) => {
      const category = row.original.category;
      return <span className="text-sm text-muted-foreground">{category?.name ?? '—'}</span>;
    },
    enableSorting: false,
  },
  {
    accessorKey: 'price',
    header: ({ column }) => <DataTableColumnHeader<Item, unknown> column={column} title="Harga" />,
    cell: ({ row }) => {
      const price = row.getValue('price') as number;
      return <span>Rp {price.toLocaleString('id-ID')}</span>;
    },
  },
  {
    accessorKey: 'stock',
    header: ({ column }) => <DataTableColumnHeader<Item, unknown> column={column} title="Stok" />,
    cell: ({ row }) => {
      const stock = row.getValue('stock') as number;
      return (
        <Badge variant={stock > 0 ? 'default' : 'destructive'}>
          {stock}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'discount',
    header: 'Diskon',
    cell: ({ row }) => {
      const discount = row.getValue('discount') as number;
      return discount > 0 ? (
        <Badge variant="outline" className="text-orange-600 border-orange-300">
          -{discount}%
        </Badge>
      ) : <span className="text-muted-foreground">—</span>;
    },
  },
  {
    accessorKey: 'is_available',
    header: 'Status',
    cell: ({ row }) => {
      const available = row.getValue('is_available') as boolean;
      return (
        <Badge variant={available ? 'default' : 'muted'}>
          {available ? 'Tersedia' : 'Nonaktif'}
        </Badge>
      );
    },
  },
  {
    id: 'actions',
    header: 'Aksi',
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="flex gap-3">
          <EditButton endpoint="item" id={String(item.id)} />
          <DeleteModal resourceName="item" id={item.id} />
        </div>
      );
    },
  },
];

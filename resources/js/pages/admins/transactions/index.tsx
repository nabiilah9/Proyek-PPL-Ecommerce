import { useEffect, useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import AppLayout from '@/components/layouts/app-layout';
import { Button } from '@/components/elements/button';
import type { BreadcrumbItem, SharedData } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Transaksi', href: '/admin/transactions' },
];

interface Detail {
  id: number;
  quantity: number;
  item?: { id: number; name: string } | null;
}

interface TransactionRow {
  id: number;
  total: number | string;
  status: string;
  shipping_status: string | null;
  tracking_number: string | null;
  payment_method: string;
  recipient_name: string | null;
  delivery_method: string | null;
  created_at: string;
  user?: { id: number; username: string } | null;
  details?: Detail[];
}

interface Summary {
  pending_payment: number;
  paid: number;
  to_ship: number;
  shipped: number;
  delivered: number;
  revenue_paid: number;
}

interface Paginated<T> {
  data: T[];
  current_page: number;
  last_page: number;
  from: number | null;
  to: number | null;
  total: number;
  links: { url: string | null; label: string; active: boolean }[];
}

interface Filters {
  status: string;
  shipping_status: string;
  q: string;
  from: string;
  to: string;
}

type Props = SharedData & {
  transactions: Paginated<TransactionRow>;
  filters: Filters;
  summary: Summary;
  shippingStatuses: string[];
};

const rupiah = (value: number | string) =>
  'Rp ' + Number(value).toLocaleString('id-ID');

const badge = (status: string) => {
  const map: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-800',
    paid: 'bg-green-100 text-green-800',
    canceled: 'bg-gray-200 text-gray-700',
    failed: 'bg-red-100 text-red-700',
    packed: 'bg-blue-100 text-blue-800',
    shipped: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-emerald-100 text-emerald-800',
  };

  return map[status] ?? 'bg-gray-100 text-gray-700';
};

export default function TransactionsIndex() {
  const { transactions, filters, summary, success, error } =
    usePage<Props>().props;

  const [state, setState] = useState<Filters>(filters);

  useEffect(() => {
    if (success) toast.success(success as string);
    if (error) toast.error(error as string);
  }, [success, error]);

  const applyFilter = () => {
    router.get(route('transactions.index'), state as never, {
      preserveState: true,
      replace: true,
    });
  };

  const verify = (id: number) => {
    router.post(route('transactions.verify', id), {}, { preserveScroll: true });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Transaksi" />

      <div className="flex h-full flex-1 flex-col gap-4 p-4">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          <Stat label="Belum dibayar" value={String(summary.pending_payment)} />
          <Stat label="Sudah dibayar" value={String(summary.paid)} />
          <Stat label="Siap dikirim" value={String(summary.to_ship)} />
          <Stat label="Dikirim" value={String(summary.shipped)} />
          <Stat label="Pendapatan (paid)" value={rupiah(summary.revenue_paid)} />
        </div>

        <div className="flex flex-wrap items-end gap-2 rounded-xl border p-3">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Cari</label>
            <input
              className="h-9 rounded-md border border-neutral-300 bg-white px-3 text-sm text-black dark:bg-black dark:text-white"
              placeholder="ID / username / penerima"
              value={state.q}
              onChange={(e) => setState({ ...state, q: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && applyFilter()}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Status bayar</label>
            <select
              className="h-9 rounded-md border border-neutral-300 bg-white px-3 text-sm text-black dark:bg-black dark:text-white"
              value={state.status}
              onChange={(e) => setState({ ...state, status: e.target.value })}
            >
              <option value="">Semua</option>
              <option value="pending">pending</option>
              <option value="paid">paid</option>
              <option value="canceled">canceled</option>
              <option value="failed">failed</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Status kirim</label>
            <select
              className="h-9 rounded-md border border-neutral-300 bg-white px-3 text-sm text-black dark:bg-black dark:text-white"
              value={state.shipping_status}
              onChange={(e) => setState({ ...state, shipping_status: e.target.value })}
            >
              <option value="">Semua</option>
              {['pending', 'packed', 'shipped', 'delivered'].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Dari</label>
            <input
              type="date"
              className="h-9 rounded-md border border-neutral-300 bg-white px-3 text-sm text-black dark:bg-black dark:text-white"
              value={state.from}
              onChange={(e) => setState({ ...state, from: e.target.value })}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Sampai</label>
            <input
              type="date"
              className="h-9 rounded-md border border-neutral-300 bg-white px-3 text-sm text-black dark:bg-black dark:text-white"
              value={state.to}
              onChange={(e) => setState({ ...state, to: e.target.value })}
            />
          </div>

          <Button onClick={applyFilter}>Terapkan</Button>
          <Button
            variant="outline"
            onClick={() => {
              const reset = { status: '', shipping_status: '', q: '', from: '', to: '' };
              setState(reset);
              router.get(route('transactions.index'), {}, { preserveState: true });
            }}
          >
            Reset
          </Button>
        </div>

        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Pembeli</th>
                <th className="p-3">Total</th>
                <th className="p-3">Bayar</th>
                <th className="p-3">Kirim</th>
                <th className="p-3">Resi</th>
                <th className="p-3">Tanggal</th>
                <th className="p-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {transactions.data.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-muted-foreground">
                    Belum ada transaksi.
                  </td>
                </tr>
              )}

              {transactions.data.map((t) => (
                <tr key={t.id} className="border-t">
                  <td className="p-3 font-mono">#{t.id}</td>
                  <td className="p-3">{t.user?.username ?? '-'}</td>
                  <td className="p-3">{rupiah(t.total)}</td>
                  <td className="p-3">
                    <span className={`rounded px-2 py-0.5 text-xs ${badge(t.status)}`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`rounded px-2 py-0.5 text-xs ${badge(t.shipping_status ?? 'pending')}`}>
                      {t.shipping_status ?? 'pending'}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-xs">{t.tracking_number ?? '-'}</td>
                  <td className="p-3">{new Date(t.created_at).toLocaleDateString('id-ID')}</td>
                  <td className="flex gap-2 p-3">
                    <Link
                      href={route('transactions.show', t.id)}
                      className="text-sm underline"
                    >
                      Detail
                    </Link>
                    {t.status === 'pending' && (
                      <Button size="sm" onClick={() => verify(t.id)}>
                        Verifikasi
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {transactions.links.map((link, i) => (
            <Link
              key={i}
              href={link.url ?? '#'}
              className={`rounded border px-3 py-1 text-sm ${
                link.active ? 'bg-primary text-primary-foreground' : ''
              } ${!link.url ? 'pointer-events-none opacity-40' : ''}`}
              dangerouslySetInnerHTML={{ __html: link.label }}
            />
          ))}
        </div>
      </div>
    </AppLayout>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}

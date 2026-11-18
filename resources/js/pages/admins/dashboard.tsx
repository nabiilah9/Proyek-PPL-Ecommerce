import { Head, Link, usePage } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { LogOut } from 'lucide-react';

import AppLayout from '@/components/layouts/app-layout';
import { Button } from '@/components/elements/button';

const breadcrumbs: BreadcrumbItem[] = [{
  title: 'Dashboard',
  href: '/dashboard',
}];

interface Summary {
  revenue_paid: number;
  orders_total: number;
  orders_paid: number;
  orders_pending: number;
  orders_shipped: number;
  products: number;
  products_low_stock: number;
  customers: number;
  avg_rating: number;
}

interface Point {
  label: string;
  orders: number;
  revenue: number;
  date?: string;
}

interface TopProduct {
  id: number;
  name: string;
  qty: number;
  revenue: number;
}

interface CategoryRow {
  name: string;
  qty: number;
}

interface DashboardProps {
  summary: Summary;
  daily: Point[];
  monthly: Point[];
  topProducts: TopProduct[];
  byCategory: CategoryRow[];
}

const rupiah = (value: number) => 'Rp ' + Number(value ?? 0).toLocaleString('id-ID');
const shortRupiah = (value: number) => {
  if (value >= 1000000) return 'Rp ' + (value / 1000000).toFixed(1) + 'jt';
  if (value >= 1000) return 'Rp ' + Math.round(value / 1000) + 'rb';
  return 'Rp ' + value;
};

function BarChart({ data, valueKey }: { data: Point[]; valueKey: 'revenue' | 'orders' }) {
  const max = Math.max(1, ...data.map((d) => Number(d[valueKey])));

  return (
    <div className="flex h-48 items-end gap-2">
      {data.map((point, index) => {
        const value = Number(point[valueKey]);
        const height = Math.max(2, Math.round((value / max) * 100));

        return (
          <div key={`${point.label}-${index}`} className="group flex flex-1 flex-col items-center gap-1">
            <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100">
              {valueKey === 'revenue' ? shortRupiah(value) : value}
            </span>
            <div
              className="w-full rounded-t bg-[#51793E] transition-all group-hover:bg-[#3f6130]"
              style={{ height: `${height}%` }}
              title={`${point.label}: ${valueKey === 'revenue' ? rupiah(value) : value}`}
            />
            <span className="text-[10px] text-muted-foreground">{point.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

export default function Dashboard() {
  const props = usePage().props as unknown as DashboardProps;
  const { summary, daily, monthly, topProducts, byCategory } = props;

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Dashboard" />
      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold">Dashboard Admin</h1>
          <Button variant="destructive" asChild>
            <Link href={route('logout')} method="post" as="button">
              <LogOut />
              Keluar
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Pendapatan (dibayar)"
            value={rupiah(summary.revenue_paid)}
            hint={`${summary.orders_paid} pesanan dibayar`}
          />
          <StatCard
            label="Total pesanan"
            value={String(summary.orders_total)}
            hint={`${summary.orders_pending} menunggu pembayaran`}
          />
          <StatCard
            label="Pesanan dikirim"
            value={String(summary.orders_shipped)}
            hint="status pengiriman: shipped"
          />
          <StatCard
            label="Rating rata-rata"
            value={summary.avg_rating ? `${summary.avg_rating} / 5` : '-'}
            hint={`${summary.customers} pelanggan terdaftar`}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border p-4">
            <h2 className="mb-1 font-semibold">Pendapatan 14 hari terakhir</h2>
            <p className="mb-4 text-xs text-muted-foreground">
              Hanya transaksi berstatus dibayar.
            </p>
            <BarChart data={daily} valueKey="revenue" />
          </div>

          <div className="rounded-xl border p-4">
            <h2 className="mb-1 font-semibold">Jumlah pesanan per bulan</h2>
            <p className="mb-4 text-xs text-muted-foreground">Enam bulan terakhir.</p>
            <BarChart data={monthly} valueKey="orders" />
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border p-4">
            <h2 className="mb-3 font-semibold">Produk paling banyak terjual</h2>
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground">
                <tr>
                  <th className="pb-2">Produk</th>
                  <th className="pb-2 text-right">Terjual</th>
                  <th className="pb-2 text-right">Pendapatan</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-4 text-center text-muted-foreground">
                      Belum ada penjualan.
                    </td>
                  </tr>
                )}
                {topProducts.map((product) => (
                  <tr key={product.id} className="border-t">
                    <td className="py-2">{product.name}</td>
                    <td className="py-2 text-right">{product.qty}</td>
                    <td className="py-2 text-right">{rupiah(Number(product.revenue))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-xl border p-4">
            <h2 className="mb-3 font-semibold">Penjualan per kategori</h2>
            <div className="flex flex-col gap-2">
              {byCategory.length === 0 && (
                <p className="text-sm text-muted-foreground">Belum ada data kategori.</p>
              )}
              {byCategory.map((row) => {
                const maxQty = Math.max(1, ...byCategory.map((c) => Number(c.qty)));

                return (
                  <div key={row.name}>
                    <div className="flex justify-between text-sm">
                      <span>{row.name}</span>
                      <span className="text-muted-foreground">{row.qty} item</span>
                    </div>
                    <div className="mt-1 h-2 w-full rounded bg-muted">
                      <div
                        className="h-2 rounded bg-[#51793E]"
                        style={{ width: `${(Number(row.qty) / maxQty) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard label="Produk aktif" value={String(summary.products)} />
          <StatCard
            label="Stok menipis"
            value={String(summary.products_low_stock)}
            hint="stok 5 atau kurang"
          />
          <StatCard
            label="Perlu diproses"
            value={String(summary.orders_pending)}
            hint="menunggu verifikasi pembayaran"
          />
        </div>
      </div>
    </AppLayout>
  );
}

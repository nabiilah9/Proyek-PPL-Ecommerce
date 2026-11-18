import { useEffect, useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import AppLayout from '@/components/layouts/app-layout';
import { Button } from '@/components/elements/button';
import type { BreadcrumbItem, SharedData } from '@/types';

interface DetailRow {
  id: number;
  quantity: number;
  price_at_time: number | string;
  item?: { id: number; name: string; unit: string; image_url?: string | null } | null;
}

interface RatingRow {
  id: number;
  score: number;
  comment: string | null;
  item_id: number;
}

interface TransactionDetail {
  id: number;
  total: number | string;
  status: string;
  shipping_status: string | null;
  tracking_number: string | null;
  payment_method: string;
  payment_type: string | null;
  note: string | null;
  delivery_method: string | null;
  recipient_name: string | null;
  recipient_phone: string | null;
  shipping_address: string | null;
  shipping_courier: string | null;
  shipping_service: string | null;
  shipping_etd: string | null;
  shipping_cost: number | string | null;
  current_location_note: string | null;
  current_latitude: number | string | null;
  current_longitude: number | string | null;
  location_updated_at: string | null;
  paid_at: string | null;
  packed_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  verified_at: string | null;
  created_at: string;
  user?: { id: number; username: string; email: string | null } | null;
  details?: DetailRow[];
  ratings?: RatingRow[];
}

type Props = SharedData & {
  transaction: TransactionDetail;
  shippingStatuses: string[];
};

const rupiah = (value: number | string | null) =>
  'Rp ' + Number(value ?? 0).toLocaleString('id-ID');

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Transaksi', href: '/admin/transactions' },
];

export default function TransactionShow() {
  const { transaction, success, error } = usePage<Props>().props;

  const [shippingStatus, setShippingStatus] = useState(
    transaction.shipping_status ?? 'pending',
  );
  const [trackingNumber, setTrackingNumber] = useState(
    transaction.tracking_number ?? '',
  );
  const [locationNote, setLocationNote] = useState(
    transaction.current_location_note ?? '',
  );
  const [latitude, setLatitude] = useState(
    transaction.current_latitude !== null ? String(transaction.current_latitude) : '',
  );
  const [longitude, setLongitude] = useState(
    transaction.current_longitude !== null ? String(transaction.current_longitude) : '',
  );

  useEffect(() => {
    if (success) toast.success(success as string);
    if (error) toast.error(error as string);
  }, [success, error]);

  const verify = () => {
    router.post(route('transactions.verify', transaction.id), {}, { preserveScroll: true });
  };

  const updateShipping = () => {
    router.patch(
      route('transactions.shipping', transaction.id),
      {
        shipping_status: shippingStatus,
        tracking_number: trackingNumber,
        current_location_note: locationNote || null,
        current_latitude: latitude === '' ? null : Number(latitude),
        current_longitude: longitude === '' ? null : Number(longitude),
      },
      { preserveScroll: true },
    );
  };

  const cancelOrder = () => {
    if (!confirm(`Batalkan pesanan #${transaction.id}? Stok akan dikembalikan.`)) return;
    router.delete(route('transactions.destroy', transaction.id));
  };

  const subtotal = (transaction.details ?? []).reduce(
    (sum, d) => sum + Number(d.price_at_time) * d.quantity,
    0,
  );

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Transaksi #${transaction.id}`} />

      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold">Pesanan #{transaction.id}</h1>
            <p className="text-sm text-muted-foreground">
              {new Date(transaction.created_at).toLocaleString('id-ID')} ·{' '}
              {transaction.user?.username ?? '-'}
            </p>
          </div>

          <div className="flex gap-2">
            <Link href={route('transactions.index')}>
              <Button variant="outline">Kembali</Button>
            </Link>
            {transaction.status === 'pending' && (
              <Button onClick={verify}>Verifikasi pembayaran</Button>
            )}
            {transaction.status !== 'paid' && (
              <Button variant="destructive" onClick={cancelOrder}>
                Batalkan
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border p-4 md:col-span-2">
            <h2 className="mb-3 font-semibold">Item pesanan</h2>
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground">
                <tr>
                  <th className="pb-2">Produk</th>
                  <th className="pb-2">Harga</th>
                  <th className="pb-2">Qty</th>
                  <th className="pb-2 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {(transaction.details ?? []).map((d) => (
                  <tr key={d.id} className="border-t">
                    <td className="py-2">{d.item?.name ?? '-'}</td>
                    <td className="py-2">{rupiah(d.price_at_time)}</td>
                    <td className="py-2">{d.quantity}</td>
                    <td className="py-2 text-right">
                      {rupiah(Number(d.price_at_time) * d.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="text-sm">
                <tr>
                  <td colSpan={3} className="pt-3 text-right text-muted-foreground">
                    Subtotal
                  </td>
                  <td className="pt-3 text-right">{rupiah(subtotal)}</td>
                </tr>
                <tr>
                  <td colSpan={3} className="text-right text-muted-foreground">
                    Ongkir
                  </td>
                  <td className="text-right">{rupiah(transaction.shipping_cost)}</td>
                </tr>
                <tr>
                  <td colSpan={3} className="pt-2 text-right font-semibold">
                    Total
                  </td>
                  <td className="pt-2 text-right font-semibold">
                    {rupiah(transaction.total)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="flex flex-col gap-4">
            <div className="rounded-xl border p-4">
              <h2 className="mb-2 font-semibold">Pembayaran</h2>
              <Row label="Status" value={transaction.status} />
              <Row label="Metode" value={transaction.payment_method} />
              <Row label="Tipe" value={transaction.payment_type ?? '-'} />
              <Row label="Dibayar" value={transaction.paid_at ?? '-'} />
              <Row label="Diverifikasi" value={transaction.verified_at ?? '-'} />
            </div>

            <div className="rounded-xl border p-4">
              <h2 className="mb-2 font-semibold">Pengiriman</h2>
              <Row label="Metode" value={transaction.delivery_method ?? '-'} />
              <Row label="Penerima" value={transaction.recipient_name ?? '-'} />
              <Row label="Telepon" value={transaction.recipient_phone ?? '-'} />
              <Row label="Alamat" value={transaction.shipping_address ?? '-'} />
              <Row
                label="Kurir"
                value={
                  transaction.shipping_courier
                    ? `${transaction.shipping_courier} ${transaction.shipping_service ?? ''} (${transaction.shipping_etd ?? '-'})`
                    : '-'
                }
              />
              <Row label="Status kirim" value={transaction.shipping_status ?? 'pending'} />
              <Row label="Resi" value={transaction.tracking_number ?? '-'} />
              <Row label="Posisi paket" value={transaction.current_location_note ?? '-'} />
              <Row
                label="Koordinat"
                value={
                  transaction.current_latitude !== null && transaction.current_longitude !== null
                    ? `${transaction.current_latitude}, ${transaction.current_longitude}`
                    : '-'
                }
              />
              <Row label="Update posisi" value={transaction.location_updated_at ?? '-'} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border p-4">
          <h2 className="mb-3 font-semibold">Perbarui status pengiriman</h2>

          {transaction.status !== 'paid' ? (
            <p className="text-sm text-muted-foreground">
              Verifikasi pembayaran dulu sebelum memproses pengiriman.
            </p>
          ) : (
            <div className="flex flex-wrap items-end gap-3">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Status</label>
                <select
                  className="h-9 rounded-md border border-neutral-300 bg-white px-3 text-sm text-black dark:bg-black dark:text-white"
                  value={shippingStatus}
                  onChange={(e) => setShippingStatus(e.target.value)}
                >
                  {['pending', 'packed', 'shipped', 'delivered'].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Nomor resi</label>
                <input
                  className="h-9 rounded-md border border-neutral-300 bg-white px-3 text-sm text-black dark:bg-black dark:text-white"
                  placeholder="mis. JNE1234567890"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Posisi paket</label>
                <input
                  className="h-9 w-56 rounded-md border border-neutral-300 bg-white px-3 text-sm text-black dark:bg-black dark:text-white"
                  placeholder="mis. Transit Surabaya"
                  value={locationNote}
                  onChange={(e) => setLocationNote(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Latitude</label>
                <input
                  className="h-9 w-32 rounded-md border border-neutral-300 bg-white px-3 text-sm text-black dark:bg-black dark:text-white"
                  placeholder="-7.2575"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Longitude</label>
                <input
                  className="h-9 w-32 rounded-md border border-neutral-300 bg-white px-3 text-sm text-black dark:bg-black dark:text-white"
                  placeholder="112.7521"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                />
              </div>

              <Button onClick={updateShipping}>Simpan</Button>
            </div>
          )}

          <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-muted-foreground md:grid-cols-4">
            <div>dikemas: {transaction.packed_at ?? '-'}</div>
            <div>dikirim: {transaction.shipped_at ?? '-'}</div>
            <div>diterima: {transaction.delivered_at ?? '-'}</div>
            <div>catatan: {transaction.note ?? '-'}</div>
          </div>
        </div>

        {(transaction.ratings ?? []).length > 0 && (
          <div className="rounded-xl border p-4">
            <h2 className="mb-2 font-semibold">Ulasan pembeli</h2>
            {(transaction.ratings ?? []).map((r) => (
              <div key={r.id} className="border-t py-2 text-sm">
                <span className="font-medium">{r.score}/5</span> — {r.comment ?? '(tanpa komentar)'}
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 border-t py-1 text-sm first:border-t-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}

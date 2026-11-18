import { Head, Link } from '@inertiajs/react';
import {
    CheckCircle2,
    Circle,
    Clock3,
    MapPin,
    Package,
    Truck,
} from 'lucide-react';

import AppTemplate from '@/components/templates/app-template';

interface Store {
    id: number;
    name: string;
    address: string;
    city: string | null;
    province: string | null;
    phone: string | null;
    latitude: number | null;
    longitude: number | null;
    opens_at: string;
    closes_at: string;
}

interface CourierPosition {
    lat: number;
    lng: number;
    note: string | null;
    updated_at: string | null;
}

interface TimelineStep {
    key: string;
    label: string;
    description: string;
    at: string | null;
    done: boolean;
}

interface TrackingItem {
    id: number;
    name: string | null;
    image_url: string | null;
    unit: string | null;
    quantity: number;
    price: number;
}

interface TrackingTransaction {
    id: number;
    status: string;
    payment_method: string;
    delivery_method: string | null;
    shipping_status: string;
    shipping_courier: string | null;
    shipping_service: string | null;
    shipping_etd: string | null;
    shipping_cost: number;
    tracking_number: string | null;
    recipient_name: string | null;
    recipient_phone: string | null;
    shipping_address: string | null;
    total: number;
    created_at: string | null;
    items: TrackingItem[];
}

interface Props {
    transaction: TrackingTransaction;
    store: Store | null;
    courierPosition: CourierPosition | null;
    timeline: TimelineStep[];
}

const rupiah = (value: number) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    })
        .format(value)
        .replace('IDR', 'Rp.');

const formatDate = (value: string | null) =>
    value
        ? new Date(value).toLocaleString('id-ID', {
              dateStyle: 'medium',
              timeStyle: 'short',
          })
        : '-';

const buildMapUrl = (
    store: Store | null,
    courier: CourierPosition | null
): string | null => {
    const points: Array<[number, number]> = [];

    if (store?.latitude != null && store?.longitude != null) {
        points.push([store.latitude, store.longitude]);
    }

    if (courier) {
        points.push([courier.lat, courier.lng]);
    }

    if (points.length === 0) {
        return null;
    }

    const lats = points.map((point) => point[0]);
    const lngs = points.map((point) => point[1]);

    const pad = 0.02;
    const minLat = Math.min(...lats) - pad;
    const maxLat = Math.max(...lats) + pad;
    const minLng = Math.min(...lngs) - pad;
    const maxLng = Math.max(...lngs) + pad;

    const marker = courier
        ? `${courier.lat}%2C${courier.lng}`
        : `${points[0][0]}%2C${points[0][1]}`;

    return `https://www.openstreetmap.org/export/embed.html?bbox=${minLng}%2C${minLat}%2C${maxLng}%2C${maxLat}&layer=mapnik&marker=${marker}`;
};

export default function OrderTracking({
    transaction,
    store,
    courierPosition,
    timeline,
}: Props) {
    const mapUrl = buildMapUrl(store, courierPosition);
    const isPickup = transaction.delivery_method === 'pickup';

    return (
        <AppTemplate>
            <Head title={`Lacak Pesanan #${transaction.id}`} />

            <main className="mx-16 mt-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900">
                            Lacak Pesanan #{transaction.id}
                        </h1>
                        <p className="mt-1 text-sm text-neutral-600">
                            Dibuat {formatDate(transaction.created_at)}
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-700">
                            Pembayaran: {transaction.status}
                        </span>
                        <span className="rounded-full bg-[#E7F3EC] px-3 py-1 text-xs font-semibold text-[#028643]">
                            {isPickup
                                ? `Ambil di toko: ${transaction.shipping_status}`
                                : `Pengiriman: ${transaction.shipping_status}`}
                        </span>
                    </div>
                </div>

                <div className="mt-6 grid gap-6 lg:grid-cols-2">
                    <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                        <h2 className="flex items-center gap-2 font-semibold text-neutral-900">
                            <MapPin className="h-5 w-5 text-[#51793E]" />
                            Posisi paket
                        </h2>

                        {mapUrl ? (
                            <iframe
                                title="Peta posisi paket"
                                className="mt-3 h-72 w-full rounded-xl border border-neutral-200"
                                src={mapUrl}
                                loading="lazy"
                            />
                        ) : (
                            <p className="mt-3 rounded-xl bg-neutral-100 p-4 text-sm text-neutral-500">
                                Titik lokasi belum tersedia.
                            </p>
                        )}

                        <dl className="mt-4 space-y-2 text-sm text-neutral-700">
                            {store && (
                                <div>
                                    <dt className="text-xs uppercase text-neutral-500">
                                        Asal (toko)
                                    </dt>
                                    <dd>
                                        {store.name} — {store.address}
                                        {store.city ? `, ${store.city}` : ''}
                                    </dd>
                                </div>
                            )}

                            {!isPickup && (
                                <div>
                                    <dt className="text-xs uppercase text-neutral-500">
                                        Tujuan
                                    </dt>
                                    <dd>
                                        {transaction.shipping_address ??
                                            'Alamat belum diisi'}
                                        {transaction.recipient_name
                                            ? ` (${transaction.recipient_name})`
                                            : ''}
                                    </dd>
                                </div>
                            )}

                            {courierPosition && (
                                <div>
                                    <dt className="text-xs uppercase text-neutral-500">
                                        Posisi terakhir kurir
                                    </dt>
                                    <dd>
                                        {courierPosition.note ??
                                            `${courierPosition.lat}, ${courierPosition.lng}`}
                                        <span className="ml-2 text-xs text-neutral-500">
                                            {formatDate(courierPosition.updated_at)}
                                        </span>
                                    </dd>
                                </div>
                            )}

                            {transaction.tracking_number && (
                                <div>
                                    <dt className="text-xs uppercase text-neutral-500">
                                        Resi
                                    </dt>
                                    <dd className="font-mono">
                                        {transaction.shipping_courier}{' '}
                                        {transaction.tracking_number}
                                    </dd>
                                </div>
                            )}
                        </dl>
                    </section>

                    <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                        <h2 className="flex items-center gap-2 font-semibold text-neutral-900">
                            <Truck className="h-5 w-5 text-[#51793E]" />
                            Riwayat perjalanan
                        </h2>

                        <ol className="mt-4 space-y-4">
                            {timeline.map((step) => (
                                <li key={step.key} className="flex gap-3">
                                    <span className="mt-0.5">
                                        {step.done ? (
                                            <CheckCircle2 className="h-5 w-5 text-[#028643]" />
                                        ) : (
                                            <Circle className="h-5 w-5 text-neutral-300" />
                                        )}
                                    </span>
                                    <div>
                                        <p
                                            className={
                                                step.done
                                                    ? 'font-semibold text-neutral-900'
                                                    : 'font-semibold text-neutral-400'
                                            }
                                        >
                                            {step.label}
                                        </p>
                                        <p className="text-sm text-neutral-600">
                                            {step.description}
                                        </p>
                                        <p className="mt-1 flex items-center gap-1 text-xs text-neutral-500">
                                            <Clock3 className="h-3 w-3" />
                                            {formatDate(step.at)}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </section>
                </div>

                <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                    <h2 className="flex items-center gap-2 font-semibold text-neutral-900">
                        <Package className="h-5 w-5 text-[#51793E]" />
                        Isi pesanan
                    </h2>

                    <ul className="mt-3 divide-y divide-neutral-100">
                        {transaction.items.map((item) => (
                            <li
                                key={item.id}
                                className="flex items-center justify-between py-2 text-sm"
                            >
                                <span>
                                    {item.name ?? 'Produk'} × {item.quantity}
                                    {item.unit ? ` ${item.unit}` : ''}
                                </span>
                                <span className="font-semibold">
                                    {rupiah(item.price * item.quantity)}
                                </span>
                            </li>
                        ))}
                    </ul>

                    <div className="mt-3 flex justify-between border-t border-neutral-200 pt-3 text-sm">
                        <span>Ongkir</span>
                        <span>{rupiah(transaction.shipping_cost)}</span>
                    </div>
                    <div className="mt-1 flex justify-between font-bold">
                        <span>Total</span>
                        <span>{rupiah(transaction.total)}</span>
                    </div>
                </section>

                <div className="mt-6 flex flex-wrap gap-3 pb-10">
                    <Link
                        href="/pesanan-saya"
                        className="rounded-xl border border-[#51793E] px-5 py-2 text-sm font-semibold text-[#51793E]"
                    >
                        Kembali ke Pesanan Saya
                    </Link>
                    <Link
                        href={`/client/orders/${transaction.id}`}
                        className="rounded-xl bg-[#028643] px-5 py-2 text-sm font-semibold text-white"
                    >
                        Detail & Pembayaran
                    </Link>
                </div>
            </main>
        </AppTemplate>
    );
}

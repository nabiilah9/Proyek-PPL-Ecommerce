import { Head, Link, usePage } from '@inertiajs/react';
import { Clock, MapPin, Phone, Truck } from 'lucide-react';

import AppTemplate from '@/components/templates/app-template';

interface StoreLocation {
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

const mapUrl = (lat: number, lng: number) =>
    `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01}%2C${lat - 0.01}%2C${lng + 0.01}%2C${lat + 0.01}&layer=mapnik&marker=${lat}%2C${lng}`;

export default function Delivery() {
    const { storeLocation } = usePage().props as {
        storeLocation?: StoreLocation | null;
    };

    return (
        <AppTemplate>
            <Head title="Pengiriman & Lokasi Toko" />

            <main className="mx-16 mt-8">
                <h1 className="text-2xl font-bold text-neutral-900">
                    Pengiriman & Lokasi Toko
                </h1>
                <p className="mt-2 text-sm text-neutral-600">
                    Semua pesanan dikirim dari toko kami. Ongkir dihitung
                    otomatis lewat RajaOngkir sesuai kota tujuan.
                </p>

                <div className="mt-6 grid gap-6 lg:grid-cols-2">
                    <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                        <h2 className="flex items-center gap-2 font-semibold text-neutral-900">
                            <MapPin className="h-5 w-5 text-[#51793E]" />
                            {storeLocation?.name ?? 'Lokasi Toko'}
                        </h2>

                        <p className="mt-3 text-sm text-neutral-700">
                            {storeLocation?.address ?? 'Alamat toko belum diatur.'}
                            {storeLocation?.city
                                ? `, ${storeLocation.city}`
                                : ''}
                            {storeLocation?.province
                                ? `, ${storeLocation.province}`
                                : ''}
                        </p>

                        <ul className="mt-3 space-y-1 text-sm text-neutral-600">
                            {storeLocation?.phone && (
                                <li className="flex items-center gap-2">
                                    <Phone className="h-4 w-4" />
                                    {storeLocation.phone}
                                </li>
                            )}
                            {storeLocation && (
                                <li className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    Buka {storeLocation.opens_at} -{' '}
                                    {storeLocation.closes_at}
                                </li>
                            )}
                        </ul>

                        {storeLocation?.latitude != null &&
                        storeLocation?.longitude != null ? (
                            <iframe
                                title="Peta lokasi toko"
                                className="mt-4 h-64 w-full rounded-xl border border-neutral-200"
                                src={mapUrl(
                                    storeLocation.latitude,
                                    storeLocation.longitude
                                )}
                                loading="lazy"
                            />
                        ) : (
                            <p className="mt-4 rounded-xl bg-neutral-100 p-4 text-sm text-neutral-500">
                                Koordinat toko belum diatur.
                            </p>
                        )}
                    </section>

                    <section className="space-y-4">
                        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                            <h2 className="flex items-center gap-2 font-semibold text-neutral-900">
                                <Truck className="h-5 w-5 text-[#51793E]" />
                                Pilihan pengiriman
                            </h2>
                            <ul className="mt-3 space-y-2 text-sm text-neutral-700">
                                <li>
                                    <strong>Ambil di toko</strong> — tanpa
                                    ongkir, siap diambil setelah pesanan
                                    dikemas.
                                </li>
                                <li>
                                    <strong>Kirim ke alamat</strong> — kurir
                                    dan layanan dipilih saat checkout, tarif
                                    dari RajaOngkir.
                                </li>
                            </ul>
                        </div>

                        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                            <h2 className="font-semibold text-neutral-900">
                                Alur status paket
                            </h2>
                            <ol className="mt-3 space-y-1 text-sm text-neutral-700">
                                <li>1. Menunggu pembayaran</li>
                                <li>2. Dibayar / diverifikasi</li>
                                <li>3. Dikemas</li>
                                <li>4. Dikirim (resi terbit)</li>
                                <li>5. Diterima</li>
                            </ol>
                        </div>

                        <Link
                            href="/pesanan-saya"
                            className="inline-block rounded-xl bg-[#028643] px-5 py-2 text-sm font-semibold text-white"
                        >
                            Lacak Pesanan
                        </Link>
                    </section>
                </div>
            </main>
        </AppTemplate>
    );
}

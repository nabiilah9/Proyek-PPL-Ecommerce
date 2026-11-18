import { Head, Link, usePage } from '@inertiajs/react';
import { MapPin, Package, ShoppingBag, Truck } from 'lucide-react';

import AppTemplate from '@/components/templates/app-template';

interface StoreLocation {
    name: string;
    address: string;
    city: string | null;
}

export default function Welcome() {
    const { auth, storeLocation } = usePage().props as {
        auth?: { user?: { username?: string; name?: string } | null };
        storeLocation?: StoreLocation | null;
    };

    const username = auth?.user?.name ?? auth?.user?.username ?? 'Pelanggan';

    const shortcuts = [
        {
            href: '/menu',
            icon: ShoppingBag,
            title: 'Pesan kue',
            description: 'Lihat katalog dan tambahkan ke keranjang.',
        },
        {
            href: '/pesanan-saya',
            icon: Package,
            title: 'Pesanan saya',
            description: 'Riwayat, pembayaran, dan lacak paket.',
        },
        {
            href: '/Delivery',
            icon: Truck,
            title: 'Pengiriman',
            description: 'Ongkir, kurir, dan lokasi toko.',
        },
        {
            href: '/offers',
            icon: MapPin,
            title: 'Promo',
            description: 'Kode diskon yang sedang aktif.',
        },
    ];

    return (
        <AppTemplate>
            <Head title="Beranda" />

            <main className="mx-16 mt-8">
                <h1 className="text-2xl font-bold text-neutral-900">
                    Halo, {username}
                </h1>
                <p className="mt-2 text-sm text-neutral-600">
                    {storeLocation
                        ? `Pesanan dikirim dari ${storeLocation.name}, ${storeLocation.address}.`
                        : 'Selamat berbelanja di Seloyang Rasa.'}
                </p>

                <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {shortcuts.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:border-[#51793E]"
                        >
                            <item.icon className="h-6 w-6 text-[#51793E]" />
                            <h2 className="mt-3 font-semibold text-neutral-900">
                                {item.title}
                            </h2>
                            <p className="mt-1 text-sm text-neutral-600">
                                {item.description}
                            </p>
                        </Link>
                    ))}
                </div>
            </main>
        </AppTemplate>
    );
}

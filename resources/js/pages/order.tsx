import { Head, Link } from '@inertiajs/react';
import { ClipboardList, CreditCard, MapPin, PackageCheck } from 'lucide-react';

import AppTemplate from '@/components/templates/app-template';

const steps = [
    {
        icon: ClipboardList,
        title: '1. Pilih produk',
        description:
            'Buka menu, pilih kategori, lalu tambahkan produk ke keranjang.',
    },
    {
        icon: MapPin,
        title: '2. Tentukan lokasi & pengiriman',
        description:
            'Ubah lokasi lewat header, pilih kirim ke alamat atau ambil di toko.',
    },
    {
        icon: CreditCard,
        title: '3. Bayar',
        description:
            'Bayar tunai di toko, transfer bank, atau e-wallet lewat Midtrans.',
    },
    {
        icon: PackageCheck,
        title: '4. Lacak pesanan',
        description:
            'Pantau status pesanan dan posisi paket di halaman Pesanan Saya.',
    },
];

export default function OrderPage() {
    return (
        <AppTemplate>
            <Head title="Cara Pesan" />

            <main className="mx-16 mt-8">
                <h1 className="text-2xl font-bold text-neutral-900">
                    Cara Pesan di Seloyang Rasa
                </h1>
                <p className="mt-2 text-sm text-neutral-600">
                    Empat langkah dari memilih kue sampai paket tiba di rumah.
                </p>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                    {steps.map((step) => (
                        <div
                            key={step.title}
                            className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
                        >
                            <step.icon className="h-6 w-6 text-[#51793E]" />
                            <h2 className="mt-3 font-semibold text-neutral-900">
                                {step.title}
                            </h2>
                            <p className="mt-1 text-sm text-neutral-600">
                                {step.description}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="mt-8 flex gap-3">
                    <Link
                        href="/menu"
                        className="rounded-xl bg-[#028643] px-5 py-2 text-sm font-semibold text-white"
                    >
                        Mulai Belanja
                    </Link>
                    <Link
                        href="/pesanan-saya"
                        className="rounded-xl border border-[#51793E] px-5 py-2 text-sm font-semibold text-[#51793E]"
                    >
                        Pesanan Saya
                    </Link>
                </div>
            </main>
        </AppTemplate>
    );
}

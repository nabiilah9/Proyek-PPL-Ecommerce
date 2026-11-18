import { Head, Link } from '@inertiajs/react';
import { BadgePercent, CalendarClock, Ticket } from 'lucide-react';

import AppTemplate from '@/components/templates/app-template';

interface Coupon {
    id: number;
    code: string;
    description: string | null;
    type: 'percent' | 'fixed';
    value: number;
    min_spend: number | null;
    max_discount: number | null;
    ends_at: string | null;
}

interface Props {
    coupons: Coupon[];
}

const rupiah = (value: number) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    })
        .format(value)
        .replace('IDR', 'Rp.');

export default function Offers({ coupons }: Props) {
    return (
        <AppTemplate>
            <Head title="Promo & Kode Diskon" />

            <main className="mx-16 mt-8">
                <div className="flex items-center gap-3">
                    <BadgePercent className="h-8 w-8 text-[#51793E]" />
                    <h1 className="text-2xl font-bold text-neutral-900">
                        Promo & Kode Diskon
                    </h1>
                </div>
                <p className="mt-2 text-sm text-neutral-600">
                    Masukkan kode di bawah ini pada halaman keranjang sebelum
                    checkout.
                </p>

                {coupons.length === 0 ? (
                    <div className="mt-8 rounded-2xl border border-dashed border-neutral-300 p-10 text-center text-neutral-500">
                        Belum ada promo aktif. Cek lagi nanti.
                    </div>
                ) : (
                    <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {coupons.map((coupon) => (
                            <div
                                key={coupon.id}
                                className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
                            >
                                <div className="flex items-center gap-2 text-[#028643]">
                                    <Ticket className="h-5 w-5" />
                                    <span className="font-mono text-lg font-bold">
                                        {coupon.code}
                                    </span>
                                </div>

                                <p className="mt-3 text-sm text-neutral-700">
                                    {coupon.description ??
                                        (coupon.type === 'percent'
                                            ? `Diskon ${coupon.value}% dari subtotal.`
                                            : `Potongan ${rupiah(coupon.value)} dari subtotal.`)}
                                </p>

                                <ul className="mt-3 space-y-1 text-xs text-neutral-500">
                                    <li>
                                        Potongan:{' '}
                                        {coupon.type === 'percent'
                                            ? `${coupon.value}%`
                                            : rupiah(coupon.value)}
                                        {coupon.max_discount
                                            ? ` (maks ${rupiah(coupon.max_discount)})`
                                            : ''}
                                    </li>
                                    <li>
                                        Minimum belanja:{' '}
                                        {coupon.min_spend
                                            ? rupiah(coupon.min_spend)
                                            : 'tanpa minimum'}
                                    </li>
                                    <li className="flex items-center gap-1">
                                        <CalendarClock className="h-3 w-3" />
                                        {coupon.ends_at
                                            ? `Berlaku sampai ${new Date(coupon.ends_at).toLocaleDateString('id-ID')}`
                                            : 'Tanpa batas waktu'}
                                    </li>
                                </ul>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-8 flex gap-3">
                    <Link
                        href="/menu"
                        className="rounded-xl bg-[#028643] px-5 py-2 text-sm font-semibold text-white"
                    >
                        Belanja Sekarang
                    </Link>
                    <Link
                        href="/client/cart"
                        className="rounded-xl border border-[#51793E] px-5 py-2 text-sm font-semibold text-[#51793E]"
                    >
                        Buka Keranjang
                    </Link>
                </div>
            </main>
        </AppTemplate>
    );
}

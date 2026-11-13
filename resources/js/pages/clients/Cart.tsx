
import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppTemplate from '@/components/templates/app-template';

import {
    ShoppingCart,
    MapPin,
    Truck,
    Store,
    ArrowRight,
    TicketPercent,
    X,
    CheckCircle,
} from 'lucide-react';

interface CartItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
    unit: string;
    discount: number;
    total: number;
    discounted_total: number;
}

interface CheckoutFormData {
    payment_method: string;
    note: string;
    [key: string]: string | number | boolean | File | null;
}

interface VoucherData {
    code: string;
    discount: number;
}

interface CartProps {
    items: CartItem[];
    subtotal: number;
    discount: number;
    shipping: number;
    total: number;
    voucher?: VoucherData | null;
    voucherDiscount?: number;
}

export default function Cart({
    items,
    subtotal,
    discount,
    shipping,
    total,
    voucher = null,
    voucherDiscount = 0,
}: CartProps) {

    // FORM CHECKOUT
    const {
        data,
        setData,
        post,
        processing,
        errors,
    } = useForm<CheckoutFormData>({
        payment_method: 'cash',
        note: '',
    });

    // FORM VOUCHER
    const voucherForm = useForm({
        code: '',
    });

    // DELIVERY METHOD
    const [deliveryMethod, setDeliveryMethod] =
        useState<'delivery' | 'pickup'>('delivery');

    // FORMAT RUPIAH
    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        })
            .format(amount)
            .replace('IDR', 'Rp');
    };

    // UPDATE QUANTITY
    const updateQuantity = (
        itemId: number,
        newQuantity: number
    ) => {
        if (newQuantity < 1) return;

        router.patch(
            '/client/cart/update',
            {
                item_id: itemId,
                quantity: newQuantity,
            },
            {
                preserveScroll: true,
            }
        );
    };

    // REMOVE ITEM
    const removeItem = (itemId: number) => {
        router.delete('/client/cart/remove', {
            data: {
                item_id: itemId,
            },
            preserveScroll: true,
        });
    };

    // APPLY VOUCHER
    const handleApplyVoucher = (e: React.FormEvent) => {
        e.preventDefault();

        if (!voucherForm.data.code.trim()) {
            voucherForm.setError(
                'code',
                'Masukkan kode voucher terlebih dahulu.'
            );
            return;
        }

        voucherForm.post('/client/cart/apply-discount', {
            preserveScroll: true,
            onSuccess: () => {
                voucherForm.reset();
            },
        });
    };

    // REMOVE VOUCHER
    const handleRemoveVoucher = () => {
        router.delete('/client/cart/remove-discount', {
            preserveScroll: true,
        });
    };

    // CHECKOUT
    const handleCheckout = () => {
        if (!data.payment_method) {
            alert('Silakan pilih metode pembayaran terlebih dahulu.');
            return;
        }

        if (items.length === 0) {
            alert('Keranjang masih kosong.');
            return;
        }

        post('/client/cart/checkout', {
            preserveScroll: false,
            preserveState: false,
            onStart: () => {
                console.log('Checkout dimulai...');
            },
            onSuccess: (page) => {
                console.log('Checkout berhasil:', page.url);
            },
            onError: (formErrors) => {
                console.error('Checkout gagal:', formErrors);
            },
            onFinish: () => {
                console.log('Checkout selesai.');
            },
        });
    };

    return (
        <AppTemplate>
            <Head title="Keranjang" />

            <div className="min-h-screen bg-gray-50 text-gray-800">

                {/* HEADER */}
                <div className="bg-green-600 text-white py-6">
                    <div className="container mx-auto px-4">
                        <div className="flex items-center gap-3">
                            <ShoppingCart className="w-8 h-8" />
                            <h1 className="text-2xl font-bold">
                                Keranjang
                            </h1>
                        </div>
                    </div>
                </div>

                {/* MAIN */}
                <div className="container mx-auto px-4 py-6 max-w-4xl">

                    {items.length === 0 ? (
                        <div className="bg-white rounded-lg p-8 text-center">
                            <ShoppingCart className="w-16 h-16 mx-auto text-gray-300 mb-4" />

                            <h2 className="text-xl font-semibold text-gray-700 mb-2">
                                Keranjang Kosong
                            </h2>

                            <p className="text-gray-500">
                                Belum ada item dalam keranjang belanja Anda.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* ALAMAT */}
                            <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
                                <div className="flex items-start gap-3">
                                    <MapPin className="w-5 h-5 text-orange-500 mt-1 flex-shrink-0" />

                                    <div>
                                        <h3 className="font-semibold text-gray-800">
                                            Seinal
                                        </h3>

                                        <p className="text-sm text-gray-600">
                                            (+62) 823-4567-8912
                                        </p>

                                        <p className="text-sm text-gray-600">
                                            Jl Telang Indah 2 Timur
                                        </p>

                                        <p className="text-sm text-gray-600">
                                            KAMAL, KAB. BANGKALAN, JAWA TIMUR, ID 69162
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* CART ITEMS */}
                            <div className="bg-white rounded-lg shadow-sm mb-4">
                                {items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="p-4 border-b border-gray-100 last:border-b-0"
                                    >
                                        <div className="flex items-center justify-between gap-3">

                                            <div className="flex items-center gap-4">
                                                <div className="bg-green-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold">
                                                    {item.quantity}x
                                                </div>

                                                <div>
                                                    <h3 className="font-semibold text-gray-800">
                                                        {item.name}
                                                    </h3>

                                                    <p className="text-green-600 font-semibold">
                                                        {formatCurrency(item.price)}
                                                    </p>

                                                    {item.discount > 0 && (
                                                        <p className="text-xs text-orange-600">
                                                            Diskon produk {item.discount}%
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        updateQuantity(
                                                            item.id,
                                                            item.quantity - 1
                                                        )
                                                    }
                                                    disabled={item.quantity <= 1}
                                                    className="w-8 h-8 bg-gray-200 rounded-full disabled:opacity-50"
                                                >
                                                    -
                                                </button>

                                                <span className="w-8 text-center font-semibold">
                                                    {item.quantity}
                                                </span>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        updateQuantity(
                                                            item.id,
                                                            item.quantity + 1
                                                        )
                                                    }
                                                    className="w-8 h-8 bg-gray-200 rounded-full"
                                                >
                                                    +
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => removeItem(item.id)}
                                                    className="ml-2 text-red-500 hover:text-red-700 text-sm font-medium"
                                                >
                                                    Hapus
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* VOUCHER DISKON - SELALU TAMPIL */}
                            <div
                                id="voucher-diskon"
                                className="bg-white rounded-xl p-5 mb-4 shadow-md border-2 border-green-200"
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="bg-green-100 p-3 rounded-xl">
                                        <TicketPercent className="w-7 h-7 text-green-700" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">
                                            Gunakan Kode Voucher
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            Masukkan kode diskon untuk mendapatkan potongan harga.
                                        </p>
                                    </div>
                                </div>

                                {voucher ? (
                                    <div className="border border-green-300 bg-green-50 rounded-xl p-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle className="w-6 h-6 text-green-700" />
                                                <div>
                                                    <p className="font-bold text-green-800">
                                                        Voucher {voucher.code} berhasil digunakan
                                                    </p>
                                                    <p className="text-sm text-green-700">
                                                        Potongan {formatCurrency(voucherDiscount)}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleRemoveVoucher}
                                                className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                                            >
                                                <X className="w-4 h-4" />
                                                Hapus Voucher
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <form onSubmit={handleApplyVoucher} className="space-y-3">
                                        <div className="flex flex-col sm:flex-row gap-2">
                                            <input
                                                type="text"
                                                value={voucherForm.data.code}
                                                onChange={(e) => {
                                                    voucherForm.setData('code', e.target.value.toUpperCase());
                                                    voucherForm.clearErrors();
                                                }}
                                                placeholder="Masukkan kode, contoh HEMAT10"
                                                aria-label="Kode voucher diskon"
                                                autoComplete="off"
                                                className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 uppercase placeholder:normal-case focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-200"
                                            />
                                            <button
                                                type="submit"
                                                disabled={voucherForm.processing || !voucherForm.data.code.trim()}
                                                className="rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {voucherForm.processing ? 'Memeriksa...' : 'Gunakan Voucher'}
                                            </button>
                                        </div>

                                        {voucherForm.errors.code && (
                                            <p className="text-sm font-medium text-red-600">
                                                {voucherForm.errors.code}
                                            </p>
                                        )}

                                        <div className="rounded-lg bg-green-50 p-3">
                                            <p className="mb-2 text-xs font-semibold text-gray-700">
                                                Coba salah satu kode berikut:
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {['HEMAT5', 'HEMAT10', 'HEMAT20'].map((code) => (
                                                    <button
                                                        key={code}
                                                        type="button"
                                                        onClick={() => {
                                                            voucherForm.setData('code', code);
                                                            voucherForm.clearErrors();
                                                        }}
                                                        className="rounded-md border border-green-300 bg-white px-3 py-2 text-sm font-bold text-green-700 hover:bg-green-100"
                                                    >
                                                        {code}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </form>
                                )}
                            </div>

                            {/* RINGKASAN PESANAN */}
                            <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
                                <div className="space-y-3">

                                    <div className="flex justify-between">
                                        <span>Subtotal:</span>
                                        <span className="font-semibold">
                                            {formatCurrency(subtotal)}
                                        </span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span>Diskon produk:</span>
                                        <span className="font-semibold text-green-600">
                                            -{formatCurrency(discount)}
                                        </span>
                                    </div>

                                    {voucherDiscount > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-green-700">
                                                Diskon voucher ({voucher?.code}):
                                            </span>

                                            <span className="font-semibold text-green-600">
                                                -{formatCurrency(voucherDiscount)}
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex justify-between">
                                        <span>Ongkir:</span>
                                        <span className="font-semibold">
                                            {formatCurrency(shipping)}
                                        </span>
                                    </div>

                                    <hr className="my-3 border-gray-300" />

                                    <div className="flex justify-between text-lg">
                                        <span className="font-bold">
                                            Total bayar
                                        </span>

                                        <span className="font-bold text-green-600">
                                            {formatCurrency(total)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* PILIHAN PENGIRIMAN */}
                            <div className="mb-6">
                                <h3 className="font-semibold text-gray-800 mb-3">
                                    Pilihan Pengiriman
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                    <button
                                        type="button"
                                        onClick={() => setDeliveryMethod('delivery')}
                                        className={`bg-white rounded-lg p-4 text-center shadow-sm transition-all ${
                                            deliveryMethod === 'delivery'
                                                ? 'border-2 border-green-600 bg-green-50'
                                                : 'border border-gray-200 hover:border-green-400'
                                        }`}
                                    >
                                        <Truck className="w-12 h-12 mx-auto mb-2 text-green-600" />

                                        <h3 className="font-semibold">
                                            Delivery
                                        </h3>

                                        <p className="text-sm text-gray-600">
                                            Gratis ongkir ke seluruh Telang
                                        </p>

                                        {deliveryMethod === 'delivery' && (
                                            <p className="mt-2 text-sm font-semibold text-green-600">
                                                ✓ Dipilih
                                            </p>
                                        )}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setDeliveryMethod('pickup')}
                                        className={`bg-white rounded-lg p-4 text-center shadow-sm transition-all ${
                                            deliveryMethod === 'pickup'
                                                ? 'border-2 border-green-600 bg-green-50'
                                                : 'border border-gray-200 hover:border-green-400'
                                        }`}
                                    >
                                        <Store className="w-12 h-12 mx-auto mb-2 text-green-600" />

                                        <h3 className="font-semibold">
                                            Ambil langsung di toko
                                        </h3>

                                        <p className="text-sm text-gray-600">
                                            Cepat, langsung siap
                                        </p>

                                        {deliveryMethod === 'pickup' && (
                                            <p className="mt-2 text-sm font-semibold text-green-600">
                                                ✓ Dipilih
                                            </p>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* METODE PEMBAYARAN */}
                            <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
                                <h3 className="font-semibold text-gray-800 mb-3">
                                    Metode Pembayaran
                                </h3>

                                <div className="space-y-3">
                                    {[
                                        { value: 'cash', label: 'Tunai (Cash)' },
                                        { value: 'bank', label: 'Transfer Bank' },
                                        { value: 'e-wallet', label: 'E-Wallet' },
                                    ].map((method) => (
                                        <label
                                            key={method.value}
                                            className="flex items-center gap-3 cursor-pointer"
                                        >
                                            <input
                                                type="radio"
                                                name="payment_method"
                                                value={method.value}
                                                checked={
                                                    data.payment_method === method.value
                                                }
                                                onChange={(e) =>
                                                    setData(
                                                        'payment_method',
                                                        e.target.value
                                                    )
                                                }
                                                className="text-green-600"
                                            />

                                            <span>{method.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* CATATAN */}
                            <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Catatan Pesanan (Opsional)
                                </label>

                                <textarea
                                    value={data.note}
                                    onChange={(e) =>
                                        setData('note', e.target.value)
                                    }
                                    placeholder="Tambahkan catatan untuk pesanan Anda..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                    rows={3}
                                />
                            </div>

                            {/* ERROR CHECKOUT */}
                            {Object.keys(errors).length > 0 && (
                                <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4 mb-4">
                                    <p className="font-semibold mb-1">
                                        Checkout gagal
                                    </p>

                                    {Object.entries(errors).map(([key, value]) => (
                                        <p key={key} className="text-sm">
                                            {String(value)}
                                        </p>
                                    ))}
                                </div>
                            )}

                            {/* CHECKOUT BUTTON */}
                            <button
                                type="button"
                                onClick={handleCheckout}
                                disabled={processing || items.length === 0}
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        Checkout!
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </AppTemplate>
    );
}

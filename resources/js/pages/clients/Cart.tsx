import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppTemplate from '@/components/templates/app-template';

import {
    ShoppingCart,
    MapPin,
    Truck,
    Store,
    ArrowRight,
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

interface CartProps {
    items: CartItem[];
    subtotal: number;
    discount: number;
    shipping: number;
    total: number;
}

export default function Cart({
    items,
    subtotal,
    discount,
    shipping,
    total,
}: CartProps) {

    // ==========================================
    // FORM CHECKOUT
    // ==========================================

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

    // ==========================================
    // DELIVERY METHOD
    // ==========================================

    const [deliveryMethod, setDeliveryMethod] =
        useState<'delivery' | 'pickup'>('delivery');

    // ==========================================
    // UPDATE QUANTITY
    // ==========================================

    const updateQuantity = (
        itemId: number,
        newQuantity: number
    ) => {
        if (newQuantity < 1) {
            return;
        }

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

    // ==========================================
    // REMOVE ITEM
    // ==========================================

    const removeItem = (itemId: number) => {
        router.delete(
            '/client/cart/remove',
            {
                data: {
                    item_id: itemId,
                },
                preserveScroll: true,
            }
        );
    };

    // ==========================================
    // CHECKOUT
    // ==========================================

    const handleCheckout = () => {
        console.log('================================');
        console.log('CHECKOUT DIMULAI');
        console.log('================================');

        console.log('Payment method:', data.payment_method);
        console.log('Note:', data.note);

        // Pastikan metode pembayaran dipilih
        if (!data.payment_method) {
            alert('Silakan pilih metode pembayaran terlebih dahulu.');
            return;
        }

        // Pastikan cart tidak kosong
        if (items.length === 0) {
            alert('Keranjang masih kosong.');
            return;
        }

        post('/client/cart/checkout', {
            preserveScroll: false,
            preserveState: false,

            onStart: () => {
                console.log('Request checkout dikirim...');
            },

            onSuccess: (page) => {
                console.log('Checkout berhasil!');
                console.log('URL tujuan:', page.url);
            },

            onError: (formErrors) => {
                console.error(
                    'Checkout gagal:',
                    formErrors
                );
            },

            onFinish: () => {
                console.log(
                    'Request checkout selesai.'
                );
            },
        });
    };

    // ==========================================
    // FORMAT RUPIAH
    // ==========================================

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

    return (
        <AppTemplate>

            <Head title="Keranjang" />

            <div className="min-h-screen bg-gray-50 text-gray-800">

                {/* ==========================================
                    HEADER
                ========================================== */}

                <div className="bg-green-600 text-white py-6">

                    <div className="container mx-auto px-4">

                        <div className="flex items-center gap-3">

                            <ShoppingCart
                                className="w-8 h-8 text-white"
                            />

                            <h1 className="text-2xl font-bold text-white">
                                Keranjang
                            </h1>

                        </div>

                    </div>

                </div>

                {/* ==========================================
                    MAIN
                ========================================== */}

                <div className="container mx-auto px-4 py-6 max-w-4xl">

                    {/* ==========================================
                        KERANJANG KOSONG
                    ========================================== */}

                    {items.length === 0 ? (

                        <div className="bg-white rounded-lg p-8 text-center">

                            <ShoppingCart
                                className="w-16 h-16 mx-auto text-gray-300 mb-4"
                            />

                            <h2 className="text-xl font-semibold text-gray-700 mb-2">
                                Keranjang Kosong
                            </h2>

                            <p className="text-gray-500">
                                Belum ada item dalam keranjang belanja Anda
                            </p>

                        </div>

                    ) : (

                        <>

                            {/* ==========================================
                                ALAMAT
                            ========================================== */}

                            <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">

                                <div className="flex items-start gap-3">

                                    <MapPin
                                        className="w-5 h-5 text-orange-500 mt-1 flex-shrink-0"
                                    />

                                    <div>

                                        <h3 className="font-semibold text-gray-800">
                                            Seinal
                                        </h3>

                                        <p className="text-sm text-gray-600">
                                            (+62) 823-4567-8912
                                        </p>

                                        <p className="text-sm text-gray-600">
                                            Jl telang indah 2 timur
                                        </p>

                                        <p className="text-sm text-gray-600">
                                            KAMAL, KAB. BANGKALAN, JAWA TIMUR, ID 69162
                                        </p>

                                    </div>

                                </div>

                            </div>

                            {/* ==========================================
                                CART ITEMS
                            ========================================== */}

                            <div className="bg-white rounded-lg shadow-sm mb-4">

                                {items.map((item) => (

                                    <div
                                        key={item.id}
                                        className="p-4 border-b border-gray-100 last:border-b-0"
                                    >

                                        <div className="flex items-center justify-between">

                                            {/* PRODUK */}

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

                                                </div>

                                            </div>

                                            {/* QUANTITY */}

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
                                                    className="w-8 h-8 bg-gray-200 text-gray-700 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    -
                                                </button>

                                                <span className="w-8 text-center font-semibold text-gray-800">
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
                                                    className="w-8 h-8 bg-gray-200 text-gray-700 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
                                                >
                                                    +
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeItem(item.id)
                                                    }
                                                    className="ml-2 text-red-500 hover:text-red-700 text-sm font-medium"
                                                >
                                                    Hapus
                                                </button>

                                            </div>

                                        </div>

                                    </div>

                                ))}

                            </div>

                            {/* ==========================================
                                VOUCHER
                            ========================================== */}

                            <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">

                                <div className="flex items-center justify-between">

                                    <span className="text-gray-700">
                                        Pilih Voucher Diskonmu, lebih hemat dengan potongan harga
                                    </span>

                                    <ArrowRight
                                        className="w-5 h-5 text-green-600"
                                    />

                                </div>

                            </div>

                            {/* ==========================================
                                RINGKASAN PESANAN
                            ========================================== */}

                            <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">

                                <div className="space-y-3">

                                    <div className="flex justify-between">

                                        <span className="text-gray-700">
                                            Subtotal :
                                        </span>

                                        <span className="font-semibold text-gray-800">
                                            {formatCurrency(subtotal)}
                                        </span>

                                    </div>

                                    <div className="flex justify-between">

                                        <span className="text-gray-700">
                                            Diskon :
                                        </span>

                                        <span className="font-semibold text-green-600">
                                            -{formatCurrency(discount)}
                                        </span>

                                    </div>

                                    <div className="flex justify-between">

                                        <span className="text-gray-700">
                                            Ongkir :
                                        </span>

                                        <span className="font-semibold text-gray-800">
                                            {formatCurrency(shipping)}
                                        </span>

                                    </div>

                                    <hr className="my-3 border-gray-300" />

                                    <div className="flex justify-between text-lg">

                                        <span className="font-bold text-gray-800">
                                            Total bayar
                                        </span>

                                        <span className="font-bold text-green-600">
                                            {formatCurrency(total)}
                                        </span>

                                    </div>

                                </div>

                            </div>

                            {/* ==========================================
                                PILIHAN PENGIRIMAN
                            ========================================== */}

                            <div className="mb-6">

                                <h3 className="font-semibold text-gray-800 mb-3">
                                    Pilihan Pengiriman
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                    {/* DELIVERY */}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setDeliveryMethod('delivery')
                                        }
                                        className={`bg-white rounded-lg p-4 text-center shadow-sm transition-all ${
                                            deliveryMethod === 'delivery'
                                                ? 'border-2 border-green-600 bg-green-50'
                                                : 'border border-gray-200 hover:border-green-400'
                                        }`}
                                    >

                                        <Truck
                                            className={`w-12 h-12 mx-auto mb-2 ${
                                                deliveryMethod === 'delivery'
                                                    ? 'text-green-600'
                                                    : 'text-gray-400'
                                            }`}
                                        />

                                        <h3
                                            className={`font-semibold ${
                                                deliveryMethod === 'delivery'
                                                    ? 'text-green-700'
                                                    : 'text-gray-800'
                                            }`}
                                        >
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

                                    {/* AMBIL DI TOKO */}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setDeliveryMethod('pickup')
                                        }
                                        className={`bg-white rounded-lg p-4 text-center shadow-sm transition-all ${
                                            deliveryMethod === 'pickup'
                                                ? 'border-2 border-green-600 bg-green-50'
                                                : 'border border-gray-200 hover:border-green-400'
                                        }`}
                                    >

                                        <Store
                                            className={`w-12 h-12 mx-auto mb-2 ${
                                                deliveryMethod === 'pickup'
                                                    ? 'text-green-600'
                                                    : 'text-gray-400'
                                            }`}
                                        />

                                        <h3
                                            className={`font-semibold ${
                                                deliveryMethod === 'pickup'
                                                    ? 'text-green-700'
                                                    : 'text-gray-800'
                                            }`}
                                        >
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

                            {/* ==========================================
                                METODE PEMBAYARAN
                            ========================================== */}

                            <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">

                                <h3 className="font-semibold text-gray-800 mb-3">
                                    Metode Pembayaran
                                </h3>

                                <div className="space-y-3">

                                    {/* CASH */}

                                    <label className="flex items-center gap-3 cursor-pointer text-gray-800">

                                        <input
                                            type="radio"
                                            name="payment_method"
                                            value="cash"
                                            checked={
                                                data.payment_method === 'cash'
                                            }
                                            onChange={(e) =>
                                                setData(
                                                    'payment_method',
                                                    e.target.value
                                                )
                                            }
                                            className="text-green-600"
                                        />

                                        <span className="text-gray-800">
                                            Tunai (Cash)
                                        </span>

                                    </label>

                                    {/* BANK */}

                                    <label className="flex items-center gap-3 cursor-pointer text-gray-800">

                                        <input
                                            type="radio"
                                            name="payment_method"
                                            value="bank"
                                            checked={
                                                data.payment_method === 'bank'
                                            }
                                            onChange={(e) =>
                                                setData(
                                                    'payment_method',
                                                    e.target.value
                                                )
                                            }
                                            className="text-green-600"
                                        />

                                        <span className="text-gray-800">
                                            Transfer Bank
                                        </span>

                                    </label>

                                    {/* E-WALLET */}

                                    <label className="flex items-center gap-3 cursor-pointer text-gray-800">

                                        <input
                                            type="radio"
                                            name="payment_method"
                                            value="e-wallet"
                                            checked={
                                                data.payment_method === 'e-wallet'
                                            }
                                            onChange={(e) =>
                                                setData(
                                                    'payment_method',
                                                    e.target.value
                                                )
                                            }
                                            className="text-green-600"
                                        />

                                        <span className="text-gray-800">
                                            E-Wallet
                                        </span>

                                    </label>

                                </div>

                            </div>

                            {/* ==========================================
                                CATATAN
                            ========================================== */}

                            <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">

                                <label
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    Catatan Pesanan (Opsional)
                                </label>

                                <textarea
                                    value={data.note}
                                    onChange={(e) =>
                                        setData(
                                            'note',
                                            e.target.value
                                        )
                                    }
                                    placeholder="Tambahkan catatan untuk pesanan Anda..."
                                    className="w-full px-3 py-2 border border-gray-300 text-gray-800 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-400"
                                    rows={3}
                                />

                            </div>

                            {/* ==========================================
                                ERROR
                            ========================================== */}

                            {Object.keys(errors).length > 0 && (

                                <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4 mb-4">

                                    <p className="font-semibold mb-1">
                                        Checkout gagal
                                    </p>

                                    {Object.entries(errors).map(
                                        ([key, value]) => (

                                            <p
                                                key={key}
                                                className="text-sm"
                                            >
                                                {String(value)}
                                            </p>

                                        )
                                    )}

                                </div>

                            )}

                            {/* ==========================================
                                CHECKOUT BUTTON
                            ========================================== */}

                            <button
                                type="button"
                                onClick={handleCheckout}
                                disabled={
                                    processing ||
                                    items.length === 0
                                }
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >

                                {processing ? (

                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>

                                        Processing...
                                    </>

                                ) : (

                                    <>
                                        Checkout!

                                        <ArrowRight
                                            className="w-5 h-5"
                                        />
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
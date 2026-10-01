import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppTemplate from '@/components/templates/app-template';
import { ShoppingCart, MapPin, Truck, Store, ArrowRight } from 'lucide-react';

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

export default function Cart({ items, subtotal, discount, shipping, total }: CartProps) {
    const { data, setData, post, processing } = useForm<CheckoutFormData>({
        payment_method: 'cash',
        note: '',
    });

    const updateQuantity = (itemId: number, newQuantity: number) => {
        router.patch(route('client.cart.update'), {
            data: {
                item_id: itemId,
                quantity: newQuantity
            },
            preserveScroll: true
        });
    };

    const removeItem = (itemId: number) => {
        router.delete(route('client.cart.remove'), {
            data: {
                item_id: itemId
            },
            preserveScroll: true
        });
    };

    const handleCheckout = () => {
        post(route('client.cart.checkout'));
    };

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount).replace('IDR', 'Rp');
    };

    return (
        <AppTemplate>
            <Head title="Keranjang" />
            <div className="min-h-screen bg-gray-50">
                <div className="bg-green-600 text-white py-6">
                    <div className="container mx-auto px-4">
                        <div className="flex items-center gap-3">
                            <ShoppingCart className="w-8 h-8" />
                            <h1 className="text-2xl font-bold">Keranjang</h1>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-6 max-w-4xl">
                    {items.length === 0 ? (
                        <div className="bg-white rounded-lg p-8 text-center">
                            <ShoppingCart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                            <h2 className="text-xl font-semibold text-gray-600 mb-2">Keranjang Kosong</h2>
                            <p className="text-gray-500">Belum ada item dalam keranjang belanja Anda</p>
                        </div>
                    ) : (
                        <>
                            {/* Delivery Address */}
                            <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
                                <div className="flex items-start gap-3">
                                    <MapPin className="w-5 h-5 text-orange-500 mt-1 flex-shrink-0" />
                                    <div>
                                        <h3 className="font-semibold text-gray-800">Seinal</h3>
                                        <p className="text-sm text-gray-600">(+62) 823-4567-8912</p>
                                        <p className="text-sm text-gray-600">Jl telang indah 2 timur</p>
                                        <p className="text-sm text-gray-600">KAMAL, KAB. BANGKALAN, JWA TIMUR, ID 69162</p>
                                    </div>
                                </div>
                            </div>

                            {/* Cart Items */}
                            <div className="bg-white rounded-lg shadow-sm mb-4">
                                {items.map((item) => (
                                    <div key={item.id} className="p-4 border-b border-gray-100 last:border-b-0">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="bg-green-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold">
                                                    {item.quantity}x
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-800">{item.name}</h3>
                                                    <p className="text-green-600 font-semibold">
                                                        {formatCurrency(item.price)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
                                                    disabled={item.quantity <= 1}
                                                >
                                                    -
                                                </button>
                                                <span className="w-8 text-center font-semibold">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
                                                >
                                                    +
                                                </button>
                                                <button
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

                            {/* Voucher Section */}
                            <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-700">Pilih Voucher Diskonmu, lebih hemat dengan potongan harga</span>
                                    <ArrowRight className="w-5 h-5 text-green-600" />
                                </div>
                            </div>

                            {/* Order Summary */}
                            <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Subtotal :</span>
                                        <span className="font-semibold">{formatCurrency(subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Diskon :</span>
                                        <span className="font-semibold text-green-600">-{formatCurrency(discount)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Ongkir :</span>
                                        <span className="font-semibold">{formatCurrency(shipping)}</span>
                                    </div>
                                    <hr className="my-3" />
                                    <div className="flex justify-between text-lg">
                                        <span className="font-bold">Total bayar</span>
                                        <span className="font-bold text-green-600">{formatCurrency(total)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Delivery Options */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                                    <Truck className="w-12 h-12 text-green-600 mx-auto mb-2" />
                                    <h3 className="font-semibold text-gray-800">Delivery</h3>
                                    <p className="text-sm text-gray-600">Gratis ongkir ke seluruh telang</p>
                                </div>
                                <div className="bg-white rounded-lg p-4 text-center shadow-sm opacity-50">
                                    <Store className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                    <h3 className="font-semibold text-gray-500">Ambil langsung di toko</h3>
                                    <p className="text-sm text-gray-500">Cepat, langsung siap</p>
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
                                <h3 className="font-semibold text-gray-800 mb-3">Metode Pembayaran</h3>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="payment_method"
                                            value="cash"
                                            checked={data.payment_method === 'cash'}
                                            onChange={(e) => setData('payment_method', e.target.value)}
                                            className="text-green-600"
                                        />
                                        <span>Tunai (Cash)</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="payment_method"
                                            value="bank"
                                            checked={data.payment_method === 'bank'}
                                            onChange={(e) => setData('payment_method', e.target.value)}
                                            className="text-green-600"
                                        />
                                        <span>Transfer Bank</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="payment_method"
                                            value="e-wallet"
                                            checked={data.payment_method === 'e-wallet'}
                                            onChange={(e) => setData('payment_method', e.target.value)}
                                            className="text-green-600"
                                        />
                                        <span>E-Wallet</span>
                                    </label>
                                </div>
                            </div>

                            {/* Note */}
                            <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Catatan Pesanan (Opsional)
                                </label>
                                <textarea
                                    value={data.note}
                                    onChange={(e) => setData('note', e.target.value)}
                                    placeholder="Tambahkan catatan untuk pesanan Anda..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    rows={3}
                                />
                            </div>

                            {/* Checkout Button */}
                            <button
                                onClick={handleCheckout}
                                disabled={processing}
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
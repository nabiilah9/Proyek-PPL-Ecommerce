import React, { useState, useEffect } from 'react';
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
    recipient_name: string;
    recipient_phone: string;
    street: string;
    destination_id: number | null;
    destination_label: string;
    courier: string;
    service: string;
    [key: string]: string | number | boolean | File | null;
}

interface Destination { id: number; label: string }
interface ShippingOption { courier: string; name: string; service: string; description: string; cost: number; etd: string }

interface CartProps {
    items: CartItem[];
    subtotal: number;
    discount: number;
    shipping: number;
    total: number;
    prefill?: { name: string; phone: string };
    coupon?: { code: string; description: string | null } | null;
    couponDiscount?: number;
    clientLocation?: { destination_id: number; label: string; city: string | null } | null;
}

export default function Cart({
    items,
    subtotal,
    discount,
    shipping,
    total,
    prefill,
    coupon = null,
    couponDiscount = 0,
    clientLocation = null,
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
        transform,
    } = useForm<CheckoutFormData>({
        payment_method: 'cash',
        note: '',

        recipient_name: prefill?.name ?? '',
        recipient_phone: prefill?.phone ?? '',

        street: '',
        // Lokasi dari header "Change Location" dipakai sebagai nilai awal.
        destination_id: clientLocation?.destination_id ?? null,
        destination_label: clientLocation?.label ?? '',

        courier: '',
        service: '',
    });


    // ==========================================
    // DELIVERY METHOD
    // ==========================================

    const [deliveryMethod, setDeliveryMethod] =
        useState<'delivery' | 'pickup'>('delivery');


    // ==========================================
    // RAJAONGKIR STATE
    // ==========================================

    const [keyword, setKeyword] = useState('');
    const [results, setResults] = useState<Destination[]>([]);
    const [options, setOptions] = useState<ShippingOption[]>([]);

    // PPL-10: kode diskon (Rule-Based System)
    const [couponCode, setCouponCode] = useState('');
    const [couponLoading, setCouponLoading] = useState(false);

    const applyCoupon = () => {
        if (!couponCode.trim()) return;

        setCouponLoading(true);

        router.post(
            route('client.cart.coupon.apply'),
            { code: couponCode.trim() },
            {
                preserveScroll: true,
                onFinish: () => setCouponLoading(false),
            },
        );
    };

    const removeCoupon = () => {
        setCouponLoading(true);

        router.delete(route('client.cart.coupon.remove'), {
            preserveScroll: true,
            onFinish: () => {
                setCouponLoading(false);
                setCouponCode('');
            },
        });
    };

    const [loadingShipping, setLoadingShipping] = useState(false);
    const [shippingError, setShippingError] = useState('');

    // ==========================================
    // XSRF TOKEN
    // ==========================================

    const xsrf = () => {
        const prefix = 'XSRF-TOKEN=';

        return decodeURIComponent(
            document.cookie
                .split('; ')
                .find((c) => c.startsWith(prefix))
                ?.slice(prefix.length) ?? ''
        );
    };

    // ==========================================
    // CARI DESTINATION
    // ==========================================

    useEffect(() => {
        if (
            keyword.length < 3 ||
            keyword === data.destination_label
        ) {
            setResults([]);
            return;
        }

        const t = setTimeout(async () => {
            try {
                const res = await fetch(
                    `/client/shipping/destinations?search=${encodeURIComponent(keyword)}`,
                    {
                        headers: {
                            Accept: 'application/json',
                        },
                    }
                );

                setResults(res.ok ? await res.json() : []);
            } catch (error) {
                console.error('Gagal mencari tujuan:', error);
                setResults([]);
            }
        }, 400);

        return () => clearTimeout(t);

    }, [keyword, data.destination_label]);

    // ==========================================
    // HITUNG ONGKIR
    // ==========================================

    const loadOptions = async (destinationId: number) => {
        setOptions([]);
        setShippingError('');
        setLoadingShipping(true);

        try {
            const res = await fetch('/client/shipping/cost', {
                method: 'POST',

                headers: {
                    'X-XSRF-TOKEN': xsrf(),
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },

                body: JSON.stringify({
                    destination_id: destinationId,
                }),
            });

            const json = await res.json();

            if (!res.ok) {
                setShippingError(
                    json.message ?? 'Gagal menghitung ongkir'
                );
                return;
            }

            setOptions(json.options ?? []);

        } catch (error) {
            console.error('Gagal menghitung ongkir:', error);

            setShippingError(
                'Tidak dapat menghubungi layanan pengiriman.'
            );

        } finally {
            setLoadingShipping(false);
        }
    };

    // ==========================================
    // PILIH DESTINATION
    // ==========================================

    const pickDestination = (d: Destination) => {
        setKeyword(d.label);
        setResults([]);

        setData((prev) => ({
            ...prev,
            destination_id: d.id,
            destination_label: d.label,
            courier: '',
            service: '',
        }));

        loadOptions(d.id);
    };

    // ==========================================
    // HITUNG ULANG ONGKIR JIKA CART BERUBAH
    // ==========================================

    useEffect(() => {
        if (data.destination_id) {
            setData((prev) => ({
                ...prev,
                courier: '',
                service: '',
            }));

            loadOptions(Number(data.destination_id));
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [items]);

    // ==========================================
    // ONGKIR DAN TOTAL
    // ==========================================

    const selected = options.find(
        (o) =>
            o.courier === data.courier &&
            o.service === data.service
    );

    const shippingCost =
        deliveryMethod === 'delivery'
            ? (selected?.cost ?? 0)
            : 0;

    const grandTotal = total - shipping + shippingCost;


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
        // Pastikan data pengiriman lengkap
        if (deliveryMethod === 'delivery') {
            if (
                !data.recipient_name ||
                !data.recipient_phone ||
                !data.street ||
                !data.destination_id
            ) {
                alert('Lengkapi data pengiriman terlebih dahulu.');
                return;
            }

            if (!selected) {
                alert('Pilih layanan kurir terlebih dahulu.');
                return;
            }
        }

        // Kirim metode pengiriman ke backend
        transform((d) => ({
            ...d,
            delivery_method: deliveryMethod,
        }));

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
                                        className={`bg-white rounded-lg p-4 text-center shadow-sm transition-all ${deliveryMethod === 'delivery'
                                            ? 'border-2 border-green-600 bg-green-50'
                                            : 'border border-gray-200 hover:border-green-400'
                                            }`}
                                    >

                                        <Truck
                                            className={`w-12 h-12 mx-auto mb-2 ${deliveryMethod === 'delivery'
                                                ? 'text-green-600'
                                                : 'text-gray-400'
                                                }`}
                                        />

                                        <h3
                                            className={`font-semibold ${deliveryMethod === 'delivery'
                                                ? 'text-green-700'
                                                : 'text-gray-800'
                                                }`}
                                        >
                                            Delivery
                                        </h3>

                                        <p className="text-sm text-gray-600">
                                            Ongkos kirim dihitung otomatis
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
                                        className={`bg-white rounded-lg p-4 text-center shadow-sm transition-all ${deliveryMethod === 'pickup'
                                            ? 'border-2 border-green-600 bg-green-50'
                                            : 'border border-gray-200 hover:border-green-400'
                                            }`}
                                    >

                                        <Store
                                            className={`w-12 h-12 mx-auto mb-2 ${deliveryMethod === 'pickup'
                                                ? 'text-green-600'
                                                : 'text-gray-400'
                                                }`}
                                        />

                                        <h3
                                            className={`font-semibold ${deliveryMethod === 'pickup'
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

                                {/* ==========================================
                                DATA PENGIRIMAN
                            ========================================== */}

                                {deliveryMethod === 'delivery' && (

                                    <div className="bg-white rounded-lg p-4 mt-4 shadow-sm">

                                        <h3 className="font-semibold text-gray-800 mb-3">
                                            Data Pengiriman
                                        </h3>

                                        <div className="space-y-3">

                                            {/* NAMA PENERIMA */}

                                            <div>

                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Nama Penerima
                                                </label>

                                                <input
                                                    type="text"
                                                    value={data.recipient_name}
                                                    onChange={(e) =>
                                                        setData(
                                                            'recipient_name',
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="Masukkan nama penerima"
                                                    className="w-full px-3 py-2 border border-gray-300 text-black bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-400"
                                                />

                                                {errors.recipient_name && (
                                                    <p className="text-sm text-red-500 mt-1">
                                                        {errors.recipient_name}
                                                    </p>
                                                )}

                                            </div>

                                            {/* NOMOR TELEPON */}

                                            <div>

                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Nomor Telepon
                                                </label>

                                                <input
                                                    inputMode="tel"
                                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-black"
                                                    placeholder="Nomor telepon (08xxxxxxxxxx)"
                                                    value={data.recipient_phone}
                                                    onChange={(e) => setData('recipient_phone', e.target.value.replace(/[^\d+]/g, ''))}
                                                />

                                                {errors.recipient_phone && (
                                                    <p className="text-sm text-red-500 mt-1">
                                                        {errors.recipient_phone}
                                                    </p>
                                                )}

                                            </div>

                                            {/* ALAMAT LENGKAP */}

                                            <div>

                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Alamat Lengkap
                                                </label>

                                                <textarea
                                                    value={data.street}
                                                    onChange={(e) =>
                                                        setData(
                                                            'street',
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="Nama jalan, nomor rumah, RT/RW, dan detail alamat..."
                                                    rows={3}
                                                    className="w-full px-3 py-2 border border-gray-300 text-black bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-400"
                                                />

                                                {errors.street && (
                                                    <p className="text-sm text-red-500 mt-1">
                                                        {errors.street}
                                                    </p>
                                                )}

                                            </div>

                                            {/* PENCARIAN TUJUAN */}

                                            <div>

                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Kota / Kecamatan Tujuan
                                                </label>

                                                <div className="relative">

                                                    <input
                                                        type="text"
                                                        value={keyword}
                                                        onChange={(e) => {
                                                            setKeyword(e.target.value);

                                                            setData((prev) => ({
                                                                ...prev,
                                                                destination_id: null,
                                                                destination_label: '',
                                                                courier: '',
                                                                service: '',
                                                            }));

                                                            setOptions([]);
                                                        }}
                                                        placeholder="Cari kota atau kecamatan..."
                                                        autoComplete="off"
                                                        className="w-full px-3 py-2 border border-gray-300 text-black bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-400"
                                                    />

                                                    {results.length > 0 && (

                                                        <ul className="absolute z-20 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-52 overflow-y-auto">

                                                            {results.map((d) => (

                                                                <li
                                                                    key={d.id}
                                                                    onClick={() =>
                                                                        pickDestination(d)
                                                                    }
                                                                    className="px-3 py-2 text-sm text-gray-700 cursor-pointer hover:bg-green-50"
                                                                >
                                                                    {d.label}
                                                                </li>

                                                            ))}

                                                        </ul>

                                                    )}

                                                </div>

                                                {data.destination_label && (

                                                    <p className="text-sm text-green-600 mt-2">
                                                        Tujuan dipilih: {data.destination_label}
                                                    </p>

                                                )}

                                                {errors.destination_id && (

                                                    <p className="text-sm text-red-500 mt-1">
                                                        {errors.destination_id}
                                                    </p>

                                                )}

                                            </div>

                                            {/* STATUS ONGKIR */}

                                            {loadingShipping && (

                                                <p className="text-sm text-gray-500">
                                                    Menghitung ongkos kirim...
                                                </p>

                                            )}

                                            {shippingError && (

                                                <p className="text-sm text-red-500">
                                                    {shippingError}
                                                </p>

                                            )}

                                            {/* PILIHAN KURIR */}

                                            {options.length > 0 && (

                                                <div className="space-y-3">

                                                    <h4 className="font-semibold text-gray-800">
                                                        Pilih Kurir dan Layanan
                                                    </h4>

                                                    {options.map((o) => {

                                                        const active =
                                                            data.courier === o.courier &&
                                                            data.service === o.service;

                                                        return (

                                                            <label
                                                                key={`${o.courier}-${o.service}`}
                                                                className={`flex items-center justify-between gap-3 border rounded-lg p-3 cursor-pointer transition-all ${active
                                                                    ? 'border-2 border-green-600 bg-green-50'
                                                                    : 'border border-gray-200 hover:border-green-400'
                                                                    }`}
                                                            >

                                                                <div className="flex items-center gap-3">

                                                                    <input
                                                                        type="radio"
                                                                        name="shipping_option"
                                                                        checked={active}
                                                                        onChange={() =>
                                                                            setData((prev) => ({
                                                                                ...prev,
                                                                                courier: o.courier,
                                                                                service: o.service,
                                                                            }))
                                                                        }
                                                                        className="text-green-600"
                                                                    />

                                                                    <div>

                                                                        <p className="font-semibold text-gray-800">
                                                                            {o.courier.toUpperCase()} - {o.service}
                                                                        </p>

                                                                        <p className="text-sm text-gray-500">
                                                                            {o.description}
                                                                        </p>

                                                                    </div>

                                                                </div>

                                                                <span className="font-semibold text-green-600 whitespace-nowrap">
                                                                    {formatCurrency(o.cost)}
                                                                </span>

                                                            </label>

                                                        );

                                                    })}

                                                </div>

                                            )}

                                        </div>

                                    </div>

                                )}

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

                                    {/* PPL-10: kode diskon */}
                                    <div className="rounded-lg border border-dashed border-green-300 bg-green-50/50 p-3">

                                        {coupon ? (
                                            <div className="flex items-center justify-between gap-2">

                                                <div className="text-sm">
                                                    <div className="font-semibold text-green-700">
                                                        {coupon.code}
                                                    </div>
                                                    <div className="text-gray-600">
                                                        Potongan {formatCurrency(couponDiscount)}
                                                    </div>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={removeCoupon}
                                                    disabled={couponLoading}
                                                    className="text-xs font-semibold text-red-600 underline disabled:opacity-50"
                                                >
                                                    Lepas
                                                </button>

                                            </div>
                                        ) : (
                                            <div className="flex gap-2">

                                                <input
                                                    type="text"
                                                    value={couponCode}
                                                    onChange={(e) =>
                                                        setCouponCode(e.target.value.toUpperCase())
                                                    }
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            applyCoupon();
                                                        }
                                                    }}
                                                    placeholder="Kode diskon (mis. HEMAT10)"
                                                    className="min-w-0 flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black"
                                                />

                                                <button
                                                    type="button"
                                                    onClick={applyCoupon}
                                                    disabled={couponLoading}
                                                    className="rounded-md bg-[#51793E] px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
                                                >
                                                    Pakai
                                                </button>

                                            </div>
                                        )}

                                    </div>

                                    <div className="flex justify-between">

                                        <span className="text-gray-700">
                                            Ongkir :
                                        </span>

                                        <span className="font-semibold text-gray-800">
                                            {formatCurrency(shippingCost)}
                                        </span>

                                    </div>

                                    {deliveryMethod === 'delivery' && !selected && (

                                        <p className="text-sm text-gray-500">
                                            Pilih tujuan dan layanan kurir untuk menghitung ongkir.
                                        </p>

                                    )}

                                    <hr className="my-3 border-gray-300" />

                                    <div className="flex justify-between text-lg">

                                        <span className="font-bold text-gray-800">
                                            Total bayar
                                        </span>

                                        <span className="font-bold text-green-600">
                                            {formatCurrency(grandTotal)}
                                        </span>

                                    </div>

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
                                    className="w-full px-3 py-2 border border-gray-300 text-black bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-400"
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
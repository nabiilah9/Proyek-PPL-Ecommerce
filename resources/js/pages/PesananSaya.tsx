import React, { useEffect, useState } from "react";
import { Link, router } from "@inertiajs/react";

import {
    ShoppingCart,
    User,
    ChevronLeft,
    Package,
    Truck,
    CheckCircle,
    DollarSign,
    CreditCard,
    XCircle,
    Star,
} from "lucide-react";

/* =========================================================
   INTERFACE
========================================================= */

interface Item {
    id: number;
    name: string;
    price: number;
    image_url?: string | null;
}

interface TransactionDetail {
    id: number;
    transaction_id?: number;
    item_id?: number;

    quantity: number;
    price_at_time: number;

    item?: Item | null;
}

interface Rating {
    id: number;
    item_id: number;
    score: number;
    comment: string | null;
}

interface Transaction {
    id: number;
    total: number;
    status: string;
    payment_method: string;
    note?: string | null;
    created_at: string;
    received_at?: string | null;

    details?: TransactionDetail[];
    ratings?: Rating[];
}

interface UserData {
    name?: string;
    username?: string;
}

interface PesananSayaProps {
    user?: UserData | null;
    transactions?: Transaction[];
}

/* =========================================================
   COMPONENT
========================================================= */

export default function PesananSaya({
    user,
    transactions = [],
}: PesananSayaProps) {

    /* =====================================================
       STATE
    ===================================================== */

    const [selectedOrder, setSelectedOrder] =
        useState<Transaction | null>(null);
    const [cancellingOrderId, setCancellingOrderId] =
        useState<number | null>(null);
    const [confirmingOrderId, setConfirmingOrderId] =
        useState<number | null>(null);
    const [ratingScores, setRatingScores] =
        useState<Record<number, number>>({});
    const [ratingComments, setRatingComments] =
        useState<Record<number, string>>({});
    const [submittingRatingItemId, setSubmittingRatingItemId] =
        useState<number | null>(null);

useEffect(() => {
    if (!selectedOrder) return;

    const updatedOrder = transactions.find(
        (transaction) => transaction.id === selectedOrder.id
    );

    if (updatedOrder) {
        setSelectedOrder(updatedOrder);
    }
}, [transactions]);
    /* =====================================================
       USER NAME
    ===================================================== */

    const userName = user?.name?.trim() || user?.username?.trim() || "Pengguna";

    /* =====================================================
       FORMAT RUPIAH
    ===================================================== */

    const formatRupiah = (value: number) => {
        return `Rp ${Number(value || 0).toLocaleString("id-ID")}`;
    };

    /* =====================================================
       FORMAT TANGGAL
    ===================================================== */

    const formatDate = (date: string) => {

        if (!date) {
            return "-";
        }

        try {
            return new Date(date).toLocaleString("id-ID", {
                dateStyle: "long",
                timeStyle: "short",
            });
        } catch {
            return "-";
        }
    };

    /* =====================================================
       STATUS PESANAN
    ===================================================== */

    const getStatusText = (status: string) => {

        switch (status) {

            case "pending":
                return "Menunggu Pembayaran";

            case "paid":
                return "Lunas";

            case "failed":
                return "Pembayaran Gagal";

            case "canceled":
                return "Dibatalkan";

            case "dikemas":
                return "Dikemas";

            case "dalam_pengiriman":
                return "Dalam Pengiriman";

            case "diterima":
                return "Diterima";

            case "selesai":
                return "Selesai";

            case "cancelled":
                return "Dibatalkan";

            default:
                return status;
        }
    };

    /* =====================================================
       ICON STATUS
    ===================================================== */

    const getStatusIcon = (status: string) => {

        switch (status) {

            case "pending":
                return (
                    <DollarSign
                        size={22}
                        className="text-yellow-500"
                    />
                );

            case "dalam_pengiriman":
                return (
                    <Truck
                        size={22}
                        className="text-green-600"
                    />
                );

            case "diterima":
            case "selesai":
            case "paid":
                return (
                    <CheckCircle
                        size={22}
                        className="text-green-600"
                    />
                );

            case "canceled":
            case "cancelled":
            case "failed":
                return (
                    <XCircle
                        size={22}
                        className="text-red-600"
                    />
                );

            default:
                return (
                    <Package
                        size={22}
                        className="text-green-600"
                    />
                );
        }
    };

    const getStatusClass = (status: string) => {
        if (["paid", "diterima", "selesai"].includes(status.toLowerCase())) {
            return "text-green-600";
        }

        if (["canceled", "cancelled", "failed"].includes(status.toLowerCase())) {
            return "text-red-600";
        }

        return "text-yellow-600";
    };

    const getPaymentMethodLabel = (method: string) => {
        switch (method.toLowerCase()) {
            case "bank":
                return "Transfer Bank";
            case "e-wallet":
                return "E-Wallet";
            case "cash":
                return "Tunai (Cash)";
            default:
                return method;
        }
    };


    const cancelOrder = (transaction: Transaction) => {
        if (!window.confirm(`Batalkan pesanan #${transaction.id}?`)) {
            return;
        }

        setCancellingOrderId(transaction.id);

        router.post(
            `/client/orders/${transaction.id}/cancel`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    window.location.reload();
                },
                onFinish: () => setCancellingOrderId(null),
            }
        );
    };

    /* =====================================================
       KONFIRMASI PESANAN DITERIMA
    ===================================================== */

    const confirmOrderReceived = (transaction: Transaction) => {
        if (!window.confirm(
            `Konfirmasi bahwa pesanan #${transaction.id} sudah diterima?`
        )) {
            return;
        }

        setConfirmingOrderId(transaction.id);

        router.post(
            `/client/orders/${transaction.id}/received`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    console.log("Konfirmasi penerimaan berhasil.");
                },
                onError: (errors) => {
                    console.error("Gagal mengonfirmasi penerimaan:", errors);
                },
                onFinish: () => setConfirmingOrderId(null),
            }
        );
    };

    /* =====================================================
       KIRIM RATING DAN ULASAN
    ===================================================== */

    const submitRating = (
        transaction: Transaction,
        item: Item
    ) => {
        const score = ratingScores[item.id];

        if (!score || score < 1 || score > 5) {
            window.alert("Silakan pilih rating 1 sampai 5 bintang.");
            return;
        }

        setSubmittingRatingItemId(item.id);

        router.post(
            `/client/orders/${transaction.id}/items/${item.id}/rating`,
            {
                score,
                comment: ratingComments[item.id] ?? "",
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setRatingScores((previous) => {
                        const updated = { ...previous };
                        delete updated[item.id];
                        return updated;
                    });

                    setRatingComments((previous) => {
                        const updated = { ...previous };
                        delete updated[item.id];
                        return updated;
                    });
                },
                onFinish: () => setSubmittingRatingItemId(null),
            }
        );
    };


    /* =====================================================
       AMBIL DETAIL PRODUK
    ===================================================== */

    const getTransactionItems = (
        transaction: Transaction
    ): TransactionDetail[] => {

        if (
            transaction.details &&
            Array.isArray(transaction.details)
        ) {
            return transaction.details;
        }

        return [];
    };

    /* =====================================================
       HALAMAN DETAIL PESANAN
    ===================================================== */

    if (selectedOrder) {

        const orderItems =
            getTransactionItems(selectedOrder);

        return (
            <div className="min-h-screen bg-gray-50 text-gray-800">

                {/* HEADER */}

                <header className="bg-white border-b px-6 py-4 flex justify-between items-center">

                    <div className="text-3xl font-bold text-green-800">
                        RB Store
                    </div>

                    <div className="flex items-center gap-4">

                        <a
                            href="/Homepage"
                            className="text-gray-700 hover:text-green-600"
                        >
                            Beranda
                        </a>

                        <a
                            href="/menu"
                            className="text-gray-700 hover:text-green-600"
                        >
                            Menu
                        </a>

                        <div className="bg-green-700 text-white px-4 py-2 rounded">
                            Pesanan Saya
                        </div>

                        <div className="bg-gray-900 text-white px-4 py-2 rounded flex items-center">

                            <User
                                size={18}
                                className="mr-2"
                            />

                            {userName}

                        </div>

                    </div>

                </header>

                {/* JUDUL */}

                <div className="bg-green-700 text-white py-6">

                    <div className="max-w-5xl mx-auto px-4 flex items-center">

                        <button
                            type="button"
                            onClick={() =>
                                setSelectedOrder(null)
                            }
                            className="cursor-pointer text-white hover:text-gray-200"
                        >
                            <ChevronLeft size={28} />
                        </button>

                        <h1 className="text-2xl font-bold text-center flex-1 text-white">
                            Detail Pesanan
                        </h1>

                    </div>

                </div>

                {/* CONTENT */}

                <main className="max-w-4xl mx-auto px-4 py-8 text-gray-800">

                    {/* INFORMASI PESANAN */}

                    <div className="bg-white rounded-lg shadow p-6 mb-6 text-gray-800">

                        <div className="flex justify-between items-start">

                            <div>

                                <p className="text-gray-500 text-sm">
                                    Nomor Pesanan
                                </p>

                                <h2 className="text-2xl font-bold text-gray-900">
                                    #{selectedOrder.id}
                                </h2>

                                <p className="text-gray-500 mt-2">
                                    {formatDate(
                                        selectedOrder.created_at
                                    )}
                                </p>

                            </div>

                            <div className="flex items-center">

                                {getStatusIcon(
                                    selectedOrder.status
                                )}

                                <span className={`ml-2 font-medium ${getStatusClass(selectedOrder.status)}`}>
                                    {getStatusText(
                                        selectedOrder.status
                                    )}
                                </span>

                            </div>

                        </div>

                    </div>

                    {/* PRODUK */}

                    <div className="bg-white rounded-lg shadow p-6 mb-6 text-gray-800">

                        <h2 className="text-xl font-bold mb-5 text-gray-900">
                            Produk Pesanan
                        </h2>

                        <div className="space-y-4">

                            {orderItems.length > 0 ? (

                                orderItems.map((detail) => {

                                    const quantity =
                                        Number(
                                            detail.quantity || 0
                                        );

                                    const price =
                                        Number(
                                            detail.price_at_time || 0
                                        );

                                    const productName =
                                        detail.item?.name ??
                                        "Produk";

                                    return (
                                        <div
                                            key={detail.id}
                                            className="flex justify-between items-center border-b pb-4"
                                        >

                                            <div>

                                                <h3 className="font-semibold text-gray-900">
                                                    {productName}
                                                </h3>

                                                <p className="text-gray-600">
                                                    {quantity} x{" "}
                                                    {formatRupiah(price)}
                                                </p>

                                            </div>

                                            <div className="font-semibold text-gray-900">

                                                {formatRupiah(
                                                    quantity * price
                                                )}

                                            </div>

                                        </div>
                                    );
                                })

                            ) : (

                                <p className="text-gray-500">
                                    Detail produk tidak tersedia.
                                </p>

                            )}

                        </div>

                    </div>

                    {/* PEMBAYARAN */}

                    <div className="bg-white rounded-lg shadow p-6 mb-6 text-gray-800">

                        <h2 className="text-xl font-bold mb-4 text-gray-900">
                            Pembayaran
                        </h2>

                        <div className="flex justify-between mb-3">

                            <span className="text-gray-700">
                                Metode Pembayaran
                            </span>

                            <span className="font-medium text-gray-900">
                                {selectedOrder.payment_method}
                            </span>

                        </div>

                        <div className="flex justify-between border-t pt-4">

                            <span className="font-bold text-lg text-gray-900">
                                Total Pembayaran
                            </span>

                            <span className="font-bold text-lg text-green-600">
                                {formatRupiah(
                                    selectedOrder.total
                                )}
                            </span>

                        </div>

                    </div>
                    {/* KONFIRMASI PENERIMAAN */}

                    {selectedOrder.status === "paid" && (
                        <div className="bg-white rounded-lg shadow p-6 mb-6">
                            <h2 className="text-xl font-bold mb-3 text-gray-900">
                                Konfirmasi Penerimaan
                            </h2>

                            {selectedOrder.received_at ? (
                                <div className="flex items-start gap-3">
                                    <CheckCircle
                                        size={22}
                                        className="text-green-600 mt-1"
                                    />

                                    <div>
                                        <p className="font-semibold text-green-700">
                                            Pesanan sudah dikonfirmasi diterima.
                                        </p>

                                        <p className="text-sm text-gray-500 mt-1">
                                            Dikonfirmasi pada:{" "}
                                            {formatDate(selectedOrder.received_at)}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <p className="text-gray-600 mb-4">
                                        Jika produk sudah Anda terima, tekan tombol berikut
                                        untuk mengonfirmasi penerimaan pesanan.
                                    </p>

                                    <button
                                        type="button"
                                        onClick={() => confirmOrderReceived(selectedOrder)}
                                        disabled={confirmingOrderId === selectedOrder.id}
                                        className="bg-green-600 text-white px-5 py-3 rounded-lg hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        {confirmingOrderId === selectedOrder.id
                                            ? "Memproses..."
                                            : "Konfirmasi Pesanan Diterima"}
                                    </button>
                                </>
                            )}
                        </div>
                    )}

                    {/* RATING DAN ULASAN */}

                    {selectedOrder.received_at && (
                        <div className="bg-white rounded-lg shadow p-6 mb-6">
                            <h2 className="text-xl font-bold mb-2 text-gray-900">
                                Rating dan Ulasan Produk
                            </h2>

                            <p className="text-gray-600 mb-5">
                                Berikan penilaian terhadap produk yang Anda terima.
                            </p>

                            <div className="space-y-6">
                                {orderItems.map((detail) => {
                                    const item = detail.item;

                                    if (!item) return null;

                                    const existingRating =
                                        selectedOrder.ratings?.find(
                                            (rating) => rating.item_id === item.id
                                        );

                                    return (
                                        <div
                                            key={detail.id}
                                            className="border-b pb-5 last:border-b-0 last:pb-0"
                                        >
                                            <h3 className="font-semibold text-gray-900 mb-3">
                                                {item.name}
                                            </h3>

                                            {existingRating ? (
                                                <div className="bg-green-50 rounded-lg p-4">
                                                    <p className="text-green-700 font-semibold mb-2">
                                                        Ulasan berhasil dikirim.
                                                    </p>

                                                    <div className="flex items-center gap-1 mb-2">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <Star
                                                                key={star}
                                                                size={20}
                                                                className={
                                                                    star <= existingRating.score
                                                                        ? "fill-yellow-400 text-yellow-400"
                                                                        : "text-gray-300"
                                                                }
                                                            />
                                                        ))}

                                                        <span className="ml-2 text-sm text-gray-700">
                                                            {existingRating.score}/5
                                                        </span>
                                                    </div>

                                                    {existingRating.comment && (
                                                        <p className="text-gray-700">
                                                            {existingRating.comment}
                                                        </p>
                                                    )}
                                                </div>
                                            ) : (
                                                <div>
                                                    <p className="text-sm text-gray-600 mb-2">
                                                        Pilih rating:
                                                    </p>

                                                    <div className="flex items-center gap-2 mb-4">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <button
                                                                key={star}
                                                                type="button"
                                                                aria-label={`Rating ${star} bintang`}
                                                                onClick={() =>
                                                                    setRatingScores((previous) => ({
                                                                        ...previous,
                                                                        [item.id]: star,
                                                                    }))
                                                                }
                                                                className="cursor-pointer"
                                                            >
                                                                <Star
                                                                    size={30}
                                                                    className={
                                                                        star <= (ratingScores[item.id] ?? 0)
                                                                            ? "fill-yellow-400 text-yellow-400"
                                                                            : "text-gray-300 hover:text-yellow-400"
                                                                    }
                                                                />
                                                            </button>
                                                        ))}

                                                        <span className="text-sm text-gray-600 ml-1">
                                                            {ratingScores[item.id]
                                                                ? `${ratingScores[item.id]}/5`
                                                                : "Belum dipilih"}
                                                        </span>
                                                    </div>

                                                    <label
                                                        htmlFor={`rating-comment-${item.id}`}
                                                        className="block text-sm font-medium text-gray-700 mb-2"
                                                    >
                                                        Ulasan (opsional)
                                                    </label>

                                                    <textarea
                                                        id={`rating-comment-${item.id}`}
                                                        value={ratingComments[item.id] ?? ""}
                                                        onChange={(event) =>
                                                            setRatingComments((previous) => ({
                                                                ...previous,
                                                                [item.id]: event.target.value,
                                                            }))
                                                        }
                                                        maxLength={1000}
                                                        rows={3}
                                                        placeholder="Tuliskan pengalaman Anda mengenai produk ini..."
                                                        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                                                    />

                                                    <p className="text-xs text-gray-500 text-right mt-1">
                                                        {(ratingComments[item.id] ?? "").length}/1000 karakter
                                                    </p>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            submitRating(selectedOrder, item)
                                                        }
                                                        disabled={
                                                            submittingRatingItemId === item.id
                                                        }
                                                        className="mt-3 bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed"
                                                    >
                                                        {submittingRatingItemId === item.id
                                                            ? "Mengirim..."
                                                            : "Kirim Rating"}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* CATATAN */}

                    {selectedOrder.note && (

                        <div className="bg-white rounded-lg shadow p-6 text-gray-800">

                            <h2 className="font-bold mb-2 text-gray-900">
                                Catatan Pesanan
                            </h2>

                            <p className="text-gray-600">
                                {selectedOrder.note}
                            </p>

                        </div>

                    )}

                </main>

            </div>
        );
    }

    /* =====================================================
       HALAMAN DAFTAR PESANAN
    ===================================================== */

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800">

            {/* HEADER */}

            <header className="bg-white border-b px-6 py-4 flex justify-between items-center">

                <div className="text-3xl font-bold text-green-800">
                    RB Store
                </div>

                <div className="flex items-center gap-4">

                    <a
                        href="/Homepage"
                        className="text-gray-700 hover:text-green-600"
                    >
                        Beranda
                    </a>

                    <a
                        href="/menu"
                        className="text-gray-700 hover:text-green-600"
                    >
                        Lihat Menu
                    </a>

                    <div className="bg-green-700 text-white px-4 py-2 rounded">
                        Pesanan Saya
                    </div>

                    <div className="bg-gray-900 text-white px-4 py-2 rounded flex items-center">

                        <User
                            size={18}
                            className="mr-2"
                        />

                        {userName}

                    </div>

                </div>

            </header>

            {/* JUDUL */}

            <div className="bg-green-700 text-white py-6">

                <h1 className="text-2xl font-bold text-center text-white">
                    Pesanan Saya
                </h1>

            </div>

            {/* CONTENT */}

            <main className="max-w-5xl mx-auto px-4 py-8 text-gray-800">

                <div className="flex items-center mb-6">

                    <ShoppingCart
                        size={28}
                        className="text-green-600 mr-3"
                    />

                    <h2 className="text-xl font-semibold text-gray-900">
                        Pesanan
                    </h2>

                </div>

                {/* TIDAK ADA PESANAN */}

                {transactions.length === 0 ? (

                    <div className="bg-white rounded-lg shadow p-10 text-center">

                        <Package
                            size={60}
                            className="mx-auto text-gray-400 mb-4"
                        />

                        <h2 className="text-xl font-semibold text-gray-900">
                            Belum ada pesanan
                        </h2>

                        <p className="text-gray-500 mt-2">
                            Silakan melakukan pembelian terlebih dahulu.
                        </p>

                        <a
                            href="/menu"
                            className="inline-block mt-5 bg-green-600 text-white px-6 py-3 rounded-lg"
                        >
                            Belanja Sekarang
                        </a>

                    </div>

                ) : (

                    /* ADA PESANAN */

                    <div className="space-y-4">

                        {transactions.map((transaction) => {

                            const orderItems =
                                getTransactionItems(
                                    transaction
                                );

                            return (

                                <div
                                    key={transaction.id}
                                    className="bg-white rounded-lg shadow overflow-hidden text-gray-800"
                                >

                                    {/* BAGIAN ATAS */}

                                    <div className="p-5 border-b">

                                        <div className="flex justify-between">

                                            <div>

                                                <p className="text-sm text-gray-500">
                                                    No. Pesanan
                                                </p>

                                                <p className="font-bold text-lg text-gray-900">
                                                    #{transaction.id}
                                                </p>

                                            </div>

                                            <div className="text-right">

                                                <div className="flex items-center justify-end">

                                                    {getStatusIcon(
                                                        transaction.status
                                                    )}

                                                    <span className={`ml-2 font-medium ${getStatusClass(transaction.status)}`}>
                                                        {getStatusText(
                                                            transaction.status
                                                        )}
                                                    </span>

                                                </div>

                                                <p className="text-sm text-gray-500 mt-1">
                                                    {formatDate(
                                                        transaction.created_at
                                                    )}
                                                </p>

                                            </div>

                                        </div>

                                    </div>

                                    {/* PRODUK */}

                                    <div className="p-5">

                                        <div className="flex justify-between">

                                            <div>

                                                {orderItems.length > 0 ? (

                                                    orderItems
                                                        .slice(0, 3)
                                                        .map((detail) => {

                                                            const quantity =
                                                                Number(
                                                                    detail.quantity || 0
                                                                );

                                                            const productName =
                                                                detail.item?.name ??
                                                                "Produk";

                                                            return (

                                                                <p
                                                                    key={detail.id}
                                                                    className="text-gray-600"
                                                                >
                                                                    {quantity} x{" "}
                                                                    {productName}
                                                                </p>

                                                            );
                                                        })

                                                ) : (

                                                    <p className="text-gray-500">
                                                        Detail produk tidak tersedia.
                                                    </p>

                                                )}

                                            </div>

                                            <div className="text-right">

                                                <p className="text-green-600 font-bold text-lg">
                                                    {formatRupiah(
                                                        transaction.total
                                                    )}
                                                </p>

                                                <p className="text-sm text-gray-500 mt-1">
                                                    {getPaymentMethodLabel(transaction.payment_method)}
                                                </p>

                                                <div className="mt-3 flex flex-wrap justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setSelectedOrder(
                                                                transaction
                                                            )
                                                        }
                                                        className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-200 cursor-pointer"
                                                    >
                                                        Lihat Detail
                                                    </button>

                                                    <Link
                                                        href={`/client/orders/${transaction.id}/tracking`}
                                                        className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-lg hover:bg-green-100"
                                                    >
                                                        <Truck size={16} />
                                                        Lacak Paket
                                                    </Link>

                                                    {transaction.status.toLowerCase() === "pending" && (
                                                        <>
                                                            {transaction.payment_method.toLowerCase() !== "cash" && (
                                                                <Link
                                                                    href={`/client/orders/${transaction.id}`}
                                                                    className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                                                                >
                                                                    <CreditCard size={16} />
                                                                    Bayar via {getPaymentMethodLabel(transaction.payment_method)}
                                                                </Link>
                                                            )}

                                                            <button
                                                                type="button"
                                                                onClick={() => cancelOrder(transaction)}
                                                                disabled={cancellingOrderId === transaction.id}
                                                                className="inline-flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-lg hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                                                            >
                                                                <XCircle size={16} />
                                                                {cancellingOrderId === transaction.id ? "Membatalkan..." : "Batalkan Pesanan"}
                                                            </button>
                                                        </>
                                                    )}
                                                </div>

                                            </div>

                                        </div>

                                    </div>

                                </div>
                            );
                        })}

                    </div>

                )}

            </main>

            {/* FOOTER */}

            <footer className="bg-gray-200 mt-10 py-10 px-6">

                <div className="text-3xl font-bold text-green-800">
                    RB Store
                </div>

                <p className="text-sm text-gray-600 mt-3">
                    Company # 490039-445, Registered with House of companies.
                </p>

            </footer>

        </div>
    );
}
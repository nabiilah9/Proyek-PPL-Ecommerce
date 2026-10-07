import { Head, Link } from "@inertiajs/react";
import AppTemplate from "@/components/templates/app-template";

interface Props {
    transactionId: number;
}

export default function OrderConfirmation({
    transactionId,
}: Props) {
    return (
        <AppTemplate>

            <Head title="Pesanan Berhasil" />

            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">

                <div className="bg-white rounded-2xl shadow-md p-8 max-w-lg w-full text-center">

                    {/* ICON BERHASIL */}

                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                        <span className="text-4xl text-green-600">
                            ✓
                        </span>
                    </div>


                    {/* JUDUL */}

                    <h1 className="text-2xl font-bold text-gray-800">
                        Pesanan Berhasil!
                    </h1>


                    {/* DESKRIPSI */}

                    <p className="text-gray-500 mt-3">
                        Pesanan kamu berhasil dibuat dan sedang
                        menunggu proses pembayaran.
                    </p>


                    {/* NOMOR PESANAN */}

                    <div className="bg-gray-50 rounded-lg p-4 mt-6">

                        <p className="text-sm text-gray-500">
                            Nomor Pesanan
                        </p>

                        <p className="text-xl font-bold text-green-600 mt-1">
                            #{transactionId}
                        </p>

                        <p className="text-sm text-gray-500 mt-3">
                            Status:
                            <span className="font-semibold text-yellow-600 ml-1">
                                Pending
                            </span>
                        </p>

                    </div>


                    {/* BUTTON */}

                    <div className="flex flex-col gap-3 mt-6">

                        <Link
                            href="/pesanan-saya"
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors"
                        >
                            Lihat Pesanan Saya
                        </Link>

                        <Link
                            href="/menu"
                            className="w-full border border-gray-300 hover:bg-gray-100 text-gray-700 font-semibold py-3 rounded-lg transition-colors"
                        >
                            Kembali ke Menu
                        </Link>

                    </div>

                </div>

            </div>

        </AppTemplate>
    );
}
//komen
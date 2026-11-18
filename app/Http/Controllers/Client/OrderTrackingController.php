<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\StoreLocation;
use App\Models\Transaction;
use App\Services\MidtransService;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class OrderTrackingController extends Controller {
    /**
     * Halaman lacak paket: peta asal toko, posisi kurir terakhir, dan riwayat.
     */
    public function show(Transaction $transaction, MidtransService $midtrans): Response {
        abort_unless((int) $transaction->client_id === (int) Auth::id(), 403);

        $transaction = $midtrans->refreshStatus($transaction);
        $transaction->load(['details.item:id,name,image_url,unit']);

        $store = StoreLocation::primary();

        return Inertia::render('clients/OrderTracking', [
            'transaction' => [
                'id' => $transaction->id,
                'status' => $transaction->status,
                'payment_method' => $transaction->payment_method,
                'delivery_method' => $transaction->delivery_method,
                'shipping_status' => $transaction->shipping_status ?: 'pending',
                'shipping_courier' => $transaction->shipping_courier,
                'shipping_service' => $transaction->shipping_service,
                'shipping_etd' => $transaction->shipping_etd,
                'shipping_cost' => (float) $transaction->shipping_cost,
                'tracking_number' => $transaction->tracking_number,
                'recipient_name' => $transaction->recipient_name,
                'recipient_phone' => $transaction->recipient_phone,
                'shipping_address' => $transaction->shipping_address,
                'total' => (float) $transaction->total,
                'created_at' => optional($transaction->created_at)->toIso8601String(),
                'items' => $transaction->details->map(fn ($detail) => [
                    'id' => $detail->id,
                    'name' => $detail->item?->name,
                    'image_url' => $detail->item?->image_url,
                    'unit' => $detail->item?->unit,
                    'quantity' => (int) $detail->quantity,
                    'price' => (float) $detail->price_at_time,
                ])->values(),
            ],
            'store' => $store?->toClientArray(),
            'courierPosition' => $transaction->current_latitude !== null && $transaction->current_longitude !== null
                ? [
                    'lat' => (float) $transaction->current_latitude,
                    'lng' => (float) $transaction->current_longitude,
                    'note' => $transaction->current_location_note,
                    'updated_at' => optional($transaction->location_updated_at)->toIso8601String(),
                ]
                : null,
            'timeline' => $this->timeline($transaction),
        ]);
    }

    /**
     * Riwayat perjalanan pesanan, urut dari yang paling awal.
     *
     * @return array<int, array<string, mixed>>
     */
    private function timeline(Transaction $transaction): array {
        $steps = [];

        $steps[] = [
            'key' => 'created',
            'label' => 'Pesanan dibuat',
            'description' => 'Pesanan diterima sistem dan menunggu pembayaran.',
            'at' => optional($transaction->created_at)->toIso8601String(),
            'done' => true,
        ];

        $steps[] = [
            'key' => 'paid',
            'label' => 'Pembayaran diterima',
            'description' => $transaction->payment_method === 'cash'
                ? 'Pembayaran tunai di toko.'
                : 'Pembayaran dikonfirmasi Midtrans.',
            'at' => optional($transaction->paid_at)->toIso8601String(),
            'done' => $transaction->status === 'paid',
        ];

        if ($transaction->delivery_method === 'pickup') {
            $steps[] = [
                'key' => 'ready',
                'label' => 'Siap diambil di toko',
                'description' => 'Silakan ambil pesanan di lokasi toko yang tertera pada peta.',
                'at' => optional($transaction->packed_at)->toIso8601String(),
                'done' => in_array($transaction->shipping_status, ['packed', 'shipped', 'delivered'], true),
            ];
        } else {
            $steps[] = [
                'key' => 'packed',
                'label' => 'Sedang dikemas',
                'description' => 'Pesanan disiapkan oleh staff toko.',
                'at' => optional($transaction->packed_at)->toIso8601String(),
                'done' => in_array($transaction->shipping_status, ['packed', 'shipped', 'delivered'], true),
            ];

            $steps[] = [
                'key' => 'shipped',
                'label' => 'Dikirim',
                'description' => $transaction->tracking_number
                    ? 'Resi ' . $transaction->shipping_courier . ' ' . $transaction->tracking_number
                    : 'Paket diserahkan ke kurir.',
                'at' => optional($transaction->shipped_at)->toIso8601String(),
                'done' => in_array($transaction->shipping_status, ['shipped', 'delivered'], true),
            ];

            $steps[] = [
                'key' => 'in_transit',
                'label' => 'Dalam perjalanan',
                'description' => $transaction->current_location_note
                    ?: 'Paket menuju alamat tujuan.',
                'at' => optional($transaction->location_updated_at)->toIso8601String(),
                'done' => $transaction->shipping_status === 'shipped' || $transaction->shipping_status === 'delivered',
            ];
        }

        $steps[] = [
            'key' => 'delivered',
            'label' => $transaction->delivery_method === 'pickup' ? 'Sudah diambil' : 'Diterima',
            'description' => $transaction->delivery_method === 'pickup'
                ? 'Pesanan diambil di toko.'
                : 'Paket diterima pembeli.',
            'at' => optional($transaction->delivered_at ?? $transaction->received_at)->toIso8601String(),
            'done' => $transaction->shipping_status === 'delivered' || $transaction->received_at !== null,
        ];

        return $steps;
    }
}

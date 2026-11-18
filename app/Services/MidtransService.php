<?php

namespace App\Services;

use App\Models\Item;
use App\Models\Transaction;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Midtrans\Config;
use Midtrans\Snap;
use Midtrans\Transaction as MidtransTransaction;
use RuntimeException;
use Throwable;

class MidtransService {
    public function __construct() {
        Config::$serverKey    = config('services.midtrans.server_key');
        Config::$isProduction = (bool) config('services.midtrans.is_production');
        Config::$isSanitized  = true;
        Config::$is3ds        = true;
    }

    public function configurationIssue(): ?string {
        $serverKey = (string) config('services.midtrans.server_key');
        $isProduction = (bool) config('services.midtrans.is_production');

        if ($serverKey === '') {
            return 'MIDTRANS_SERVER_KEY belum diisi.';
        }

        if (! $isProduction && ! str_starts_with($serverKey, 'SB-Mid-server-')) {
            return 'MIDTRANS_SERVER_KEY bukan kunci sandbox. Gunakan kunci Sandbox yang berawalan SB-Mid-server-.';
        }

        if ($isProduction && str_starts_with($serverKey, 'SB-Mid-server-')) {
            return 'MIDTRANS_SERVER_KEY sandbox dipakai saat MIDTRANS_IS_PRODUCTION=true.';
        }

        return null;
    }

    public function getSnapToken(Transaction $transaction): string {
        if ($transaction->midtrans_order_id) {
            // Kasus DANA / e-wallet: settlement bisa masuk setelah pembeli
            // kembali ke toko. Membatalkan order yang sudah lunas membuat
            // Midtrans menolak (HTTP 4xx) dan halaman pembayaran error.
            $remote = $this->remoteStatus($transaction->midtrans_order_id);

            if ($remote) {
                $remoteStatus = $remote->transaction_status ?? null;
                $remoteFraud = $remote->fraud_status ?? null;

                if (in_array($remoteStatus, ['settlement', 'capture'], true)) {
                    $this->applyStatus($transaction, $remoteStatus, $remoteFraud, $remote->payment_type ?? null);

                    throw new RuntimeException('Pembayaran sudah diterima. Status pesanan diperbarui menjadi lunas.');
                }

                if (in_array($remoteStatus, ['expire', 'cancel', 'deny', 'failure'], true)) {
                    $this->applyStatus($transaction, $remoteStatus, $remoteFraud, $remote->payment_type ?? null);

                    throw new RuntimeException('Pembayaran sebelumnya sudah berakhir. Muat ulang halaman untuk melihat status terbaru.');
                }

                // Masih pending: pakai ulang token lama agar tidak menumpuk order.
                if ($remoteStatus === 'pending' && $transaction->snap_token) {
                    return $transaction->snap_token;
                }
            }
        }

        if ($transaction->snap_token || $transaction->midtrans_order_id) {
            $oldOrderId = $transaction->midtrans_order_id;

            $transaction->update([
                'midtrans_order_id' => null,
                'snap_token' => null,
            ]);

            if ($oldOrderId) {
                try {
                    MidtransTransaction::cancel($oldOrderId);
                } catch (Throwable $exception) {
                    // Order mungkin sudah expire/settle di sisi Midtrans.
                    // Jangan gagalkan pembuatan token baru karenanya.
                    Log::warning('Gagal membatalkan order Midtrans lama.', [
                        'order_id' => $oldOrderId,
                        'exception' => $exception->getMessage(),
                    ]);
                }
            }
        }

        $orderId = 'PPL-' . $transaction->id . '-' . Str::random(16);
        $user    = $transaction->user;

        $snapToken = Snap::getSnapToken([
            'transaction_details' => [
                'order_id'     => $orderId,
                'gross_amount' => (int) $transaction->total,
            ],
            'item_details' => [[
                'id'       => 'TRX-' . $transaction->id,
                'price'    => (int) $transaction->total,
                'quantity' => 1,
                'name'     => 'Pesanan #' . $transaction->id,
            ]],
            'customer_details' => array_filter([
                'first_name' => $user->name ?: $user->username,
                'email'      => $user->email,
            ]),
            'callbacks' => [
                'finish' => route('client.orders.show', $transaction->id),
            ],
            'enabled_payments' => $this->enabledPayments($transaction->payment_method),
            // Pesanan yang tidak dibayar akan expire, lalu stok dikembalikan lewat webhook
            'expiry' => ['unit' => 'minutes', 'duration' => 60],
        ]);

        $transaction->update([
            'midtrans_order_id' => $orderId,
            'snap_token'        => $snapToken,
        ]);

        return $snapToken;
    }

    public function refreshStatus(Transaction $transaction): Transaction {
        if ($transaction->status !== 'pending' || ! $transaction->midtrans_order_id) {
            return $transaction->fresh();
        }

        $status = $this->remoteStatus($transaction->midtrans_order_id);

        if (! $status) {
            return $transaction->fresh();
        }

        $this->applyStatus(
            $transaction,
            $status->transaction_status ?? null,
            $status->fraud_status ?? null,
            $status->payment_type ?? null,
        );

        return $transaction->fresh();
    }

    public function applyNotification(array $notification): void {
        $orderId = (string) ($notification['order_id'] ?? '');
        $transaction = Transaction::where('midtrans_order_id', $orderId)->first();

        if (! $transaction && preg_match('/^PPL-(\d+)-[A-Za-z0-9]+$/D', $orderId, $matches)) {
            $transaction = Transaction::query()
                ->whereKey((int) $matches[1])
                ->where('status', 'pending')
                ->whereIn('payment_method', ['bank', 'e-wallet'])
                ->whereNull('midtrans_order_id')
                ->first();

            if ($transaction) {
                $transaction->update(['midtrans_order_id' => $orderId]);
            }
        }

        if (! $transaction) {
            return;
        }

        $this->applyStatus(
            $transaction,
            $notification['transaction_status'] ?? null,
            $notification['fraud_status'] ?? null,
            $notification['payment_type'] ?? null,
        );
    }

    /**
     * Ambil status transaksi langsung dari Midtrans (bukan dari database).
     * Dipakai untuk menutup celah webhook yang tidak sampai ke server lokal.
     */
    public function remoteStatus(string $orderId): ?object {
        $configurationIssue = $this->configurationIssue();

        if ($configurationIssue) {
            Log::error('Konfigurasi Midtrans tidak valid.', [
                'order_id' => $orderId,
                'issue' => $configurationIssue,
            ]);

            return null;
        }

        try {
            return MidtransTransaction::status($orderId);
        } catch (Throwable $exception) {
            Log::warning('Gagal mengambil status Midtrans.', [
                'order_id' => $orderId,
                'exception' => $exception->getMessage(),
            ]);

            return null;
        }
    }

    public function cancelPending(Transaction $transaction): void {
        if ($transaction->midtrans_order_id) {
            try {
                MidtransTransaction::cancel($transaction->midtrans_order_id);
            } catch (Throwable $exception) {
                // Pembatalan lokal tetap boleh dilakukan meskipun Midtrans
                // offline, kredensial salah, atau order sudah tidak tersedia.
                Log::warning('Gagal membatalkan transaksi Midtrans.', [
                    'order_id' => $transaction->midtrans_order_id,
                    'exception' => $exception->getMessage(),
                ]);
            }
        }
    }

    private function applyStatus(
        Transaction $transaction,
        ?string $status,
        ?string $fraudStatus,
        ?string $paymentType,
    ): void {
        DB::transaction(function () use ($transaction, $status, $fraudStatus, $paymentType) {
            $lockedTransaction = Transaction::with('details')
                ->whereKey($transaction->id)
                ->lockForUpdate()
                ->first();

            if (! $lockedTransaction || $lockedTransaction->status !== 'pending') {
                return;
            }

            if ($status === 'settlement' || ($status === 'capture' && $fraudStatus === 'accept')) {
                $lockedTransaction->update([
                    'status' => 'paid',
                    'payment_type' => $paymentType,
                    'paid_at' => $lockedTransaction->paid_at ?? now(),
                ]);
            } elseif ($status === 'pending' || ($status === 'capture' && $fraudStatus === 'challenge')) {
                // DANA / e-wallet: pembeli sudah klik bayar, dana belum masuk.
                // Simpan jenis pembayaran agar status di UI tidak kosong.
                if ($paymentType && $lockedTransaction->payment_type !== $paymentType) {
                    $lockedTransaction->update(['payment_type' => $paymentType]);
                }
            } elseif (in_array($status, ['cancel', 'expire'], true)) {
                $this->restoreStock($lockedTransaction);
                $lockedTransaction->update(['status' => 'canceled']);
            } elseif (in_array($status, ['deny', 'failure'], true)) {
                $this->restoreStock($lockedTransaction);
                $lockedTransaction->update(['status' => 'failed']);
            }
        });
    }

    private function restoreStock(Transaction $transaction): void {
        foreach ($transaction->details as $detail) {
            Item::whereKey($detail->item_id)->increment('stock', $detail->quantity);
        }
    }

    private function enabledPayments(string $paymentMethod): array {
        return match ($paymentMethod) {
            'bank' => [
                'bank_transfer',
                'bca_va',
                'bni_va',
                'bri_va',
                'permata_va',
                'cimb_va',
                'danamon_va',
                'other_va',
            ],
            'e-wallet' => ['gopay', 'shopeepay', 'qris', 'dana'],
            default => [],
        };
    }
}

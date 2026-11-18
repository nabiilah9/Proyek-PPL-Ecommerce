<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Item;
use App\Models\Transaction;
use App\Services\MidtransService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller {
    public function token(Transaction $transaction, MidtransService $midtrans) {
        abort_unless($transaction->client_id === Auth::id(), 403);

        $transaction = $midtrans->refreshStatus($transaction);

        abort_unless($transaction->status === 'pending', 422, 'Pesanan sudah diproses.');
        abort_if($transaction->payment_method === 'cash', 422, 'Pesanan ini bayar tunai.');

        try {
            $snapToken = $midtrans->getSnapToken($transaction);
        } catch (\RuntimeException $exception) {
            // Mis. pembayaran DANA sudah settle saat pembeli menekan bayar lagi.
            return response()->json([
                'message' => $exception->getMessage(),
                'status' => $transaction->fresh()->status,
            ], 409);
        }

        return response()->json([
            'snap_token' => $snapToken,
        ]);
    }

    /**
     * Status pembayaran untuk polling di halaman konfirmasi.
     * Menutup kasus DANA/e-wallet yang settlement-nya datang setelah redirect.
     */
    public function status(Transaction $transaction, MidtransService $midtrans) {
        abort_unless($transaction->client_id === Auth::id(), 403);

        $transaction = $midtrans->refreshStatus($transaction);

        return response()->json([
            'status' => $transaction->status,
            'payment_method' => $transaction->payment_method,
            'payment_type' => $transaction->payment_type,
            'paid_at' => optional($transaction->paid_at)->toIso8601String(),
            'shipping_status' => $transaction->shipping_status,
            'total' => (float) $transaction->total,
            'configuration_issue' => $midtrans->configurationIssue(),
        ]);
    }

    public function cancel(Transaction $transaction, MidtransService $midtrans) {
        $transaction = $midtrans->refreshStatus($transaction);

        $canceled = DB::transaction(function () use ($transaction, $midtrans) {
            $lockedTransaction = Transaction::with('details')
                ->whereKey($transaction->getKey())
                ->lockForUpdate()
                ->firstOrFail();

            abort_unless($lockedTransaction->client_id === Auth::id(), 403);

            if ($lockedTransaction->status !== 'pending') {
                return false;
            }

            $midtrans->cancelPending($lockedTransaction);

            foreach ($lockedTransaction->details as $detail) {
                Item::whereKey($detail->item_id)
                    ->increment('stock', $detail->quantity);
            }

            $lockedTransaction->update(['status' => 'canceled']);

            return true;
        });

        return back()->with(
            $canceled ? 'success' : 'error',
            $canceled
                ? 'Pesanan berhasil dibatalkan.'
                : 'Pesanan tidak dapat dibatalkan karena sudah diproses.'
        );
    }
}

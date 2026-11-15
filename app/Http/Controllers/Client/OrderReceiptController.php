<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Item;
use App\Models\Rating;
use App\Models\Transaction;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderReceiptController extends Controller
{
    /**
     * Konfirmasi bahwa pesanan sudah diterima oleh pembeli.
     */
    public function confirm(Transaction $transaction): RedirectResponse
    {
        DB::transaction(function () use ($transaction) {
            $lockedTransaction = Transaction::whereKey($transaction->id)
                ->lockForUpdate()
                ->firstOrFail();

            abort_unless(
                (int) $lockedTransaction->client_id === (int) auth()->id(),
                403
            );

            if ($lockedTransaction->status !== 'paid') {
                throw ValidationException::withMessages([
                    'receipt' => 'Pesanan hanya dapat dikonfirmasi setelah pembayaran berhasil.',
                ]);
            }

            if ($lockedTransaction->received_at === null) {
                $lockedTransaction->update([
                    'received_at' => now(),
                ]);
            }
        });

        return back()->with(
            'success',
            'Pesanan berhasil dikonfirmasi telah diterima.'
        );
    }

    /**
     * Menyimpan rating dan ulasan produk dari transaksi yang sudah diterima.
     */
    public function storeRating(
        Request $request,
        Transaction $transaction,
        Item $item
    ): RedirectResponse {
        $validated = $request->validate([
            'score' => ['required', 'integer', 'min:1', 'max:5'],
            'comment' => ['nullable', 'string', 'max:1000'],
        ]);

        DB::transaction(function () use (
            $transaction,
            $item,
            $validated
        ) {
            $lockedTransaction = Transaction::whereKey($transaction->id)
                ->lockForUpdate()
                ->firstOrFail();

            abort_unless(
                (int) $lockedTransaction->client_id === (int) auth()->id(),
                403
            );

            if ($lockedTransaction->status !== 'paid') {
                throw ValidationException::withMessages([
                    'rating' => 'Pesanan belum berstatus lunas.',
                ]);
            }

            if ($lockedTransaction->received_at === null) {
                throw ValidationException::withMessages([
                    'rating' => 'Konfirmasikan penerimaan pesanan sebelum memberikan ulasan.',
                ]);
            }

            $itemExists = $lockedTransaction->details()
                ->where('item_id', $item->id)
                ->exists();

            if (! $itemExists) {
                abort(404);
            }

            $alreadyRated = Rating::where(
                'transaction_id',
                $lockedTransaction->id
            )
                ->where('item_id', $item->id)
                ->exists();

            if ($alreadyRated) {
                throw ValidationException::withMessages([
                    'rating' => 'Produk ini sudah diberi rating pada transaksi tersebut.',
                ]);
            }

            Rating::create([
                'item_id' => $item->id,
                'user_id' => auth()->id(),
                'transaction_id' => $lockedTransaction->id,
                'score' => $validated['score'],
                'comment' => $validated['comment'] ?? null,
            ]);
        });

        return back()->with(
            'success',
            'Rating dan ulasan berhasil disimpan.'
        );
    }
}

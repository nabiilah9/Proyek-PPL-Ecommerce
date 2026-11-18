<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

/**
 * PPL-03 — admin memantau transaksi masuk, memverifikasi pesanan,
 * dan memperbarui status pengiriman.
 */
class AdminTransactionController extends Controller
{
    private const SHIPPING_FLOW = ['pending', 'packed', 'shipped', 'delivered'];

    /**
     * Daftar transaksi + filter + ringkasan angka.
     */
    public function index(Request $request): Response
    {
        $filters = [
            'status' => (string) $request->query('status', ''),
            'shipping_status' => (string) $request->query('shipping_status', ''),
            'q' => trim((string) $request->query('q', '')),
            'from' => (string) $request->query('from', ''),
            'to' => (string) $request->query('to', ''),
        ];

        $transactions = Transaction::query()
            ->with(['user:id,username', 'details.item:id,name'])
            ->when($filters['status'] !== '', fn ($q) => $q->where('status', $filters['status']))
            ->when($filters['shipping_status'] !== '', fn ($q) => $q->where('shipping_status', $filters['shipping_status']))
            ->when($filters['q'] !== '', function ($q) use ($filters) {
                $keyword = $filters['q'];

                $q->where(function ($sub) use ($keyword) {
                    if (ctype_digit($keyword)) {
                        $sub->orWhere('id', (int) $keyword);
                    }

                    $sub->orWhereHas('user', fn ($u) => $u->where('username', 'like', "%{$keyword}%"))
                        ->orWhere('recipient_name', 'like', "%{$keyword}%");
                });
            })
            ->when($filters['from'] !== '', fn ($q) => $q->whereDate('created_at', '>=', $filters['from']))
            ->when($filters['to'] !== '', fn ($q) => $q->whereDate('created_at', '<=', $filters['to']))
            ->latest('id')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admins/transactions/index', [
            'transactions' => $transactions,
            'filters' => $filters,
            'summary' => [
                'pending_payment' => Transaction::where('status', 'pending')->count(),
                'paid' => Transaction::where('status', 'paid')->count(),
                'to_ship' => Transaction::where('status', 'paid')
                    ->whereIn('shipping_status', ['pending', 'packed'])->count(),
                'shipped' => Transaction::where('shipping_status', 'shipped')->count(),
                'delivered' => Transaction::where('shipping_status', 'delivered')->count(),
                'revenue_paid' => (int) Transaction::where('status', 'paid')->sum('total'),
            ],
            'shippingStatuses' => self::SHIPPING_FLOW,
        ]);
    }

    /**
     * Detail satu transaksi.
     */
    public function show(Transaction $transaction): Response
    {
        $transaction->load([
            'user:id,username,email',
            'details.item:id,name,price,unit,image_url',
            'ratings',
        ]);

        return Inertia::render('admins/transactions/show', [
            'transaction' => $transaction,
            'shippingStatuses' => self::SHIPPING_FLOW,
        ]);
    }

    /**
     * Verifikasi pembayaran: pending -> paid.
     */
    public function verify(Transaction $transaction): RedirectResponse
    {
        if ($transaction->status !== 'pending') {
            return back()->with('error', 'Hanya pesanan berstatus pending yang bisa diverifikasi.');
        }

        $transaction->update([
            'status' => 'paid',
            'paid_at' => $transaction->paid_at ?? now(),
            'verified_by' => (int) auth()->id(),
            'verified_at' => now(),
        ]);

        return back()->with('success', "Pesanan #{$transaction->id} diverifikasi sebagai dibayar.");
    }

    /**
     * Perbarui status pengiriman.
     */
    public function shipping(Request $request, Transaction $transaction): RedirectResponse
    {
        $validated = $request->validate([
            'shipping_status' => ['required', 'in:' . implode(',', self::SHIPPING_FLOW)],
            'tracking_number' => ['nullable', 'string', 'max:50'],
            'current_location_note' => ['nullable', 'string', 'max:150'],
            'current_latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'current_longitude' => ['nullable', 'numeric', 'between:-180,180'],
        ]);

        if ($transaction->status !== 'paid') {
            return back()->with('error', 'Pesanan harus sudah dibayar sebelum diproses pengiriman.');
        }

        $target = $validated['shipping_status'];
        $current = $transaction->shipping_status ?: 'pending';

        $currentIndex = array_search($current, self::SHIPPING_FLOW, true);
        $targetIndex = array_search($target, self::SHIPPING_FLOW, true);

        if ($targetIndex === false || $currentIndex === false) {
            return back()->with('error', 'Status pengiriman tidak dikenal.');
        }

        if ($targetIndex < $currentIndex) {
            return back()->with('error', 'Status pengiriman tidak boleh mundur.');
        }

        $payload = [
            'shipping_status' => $target,
            'tracking_number' => $validated['tracking_number'] ?? $transaction->tracking_number,
        ];

        // Posisi paket terakhir (dipakai halaman lacak paket pembeli).
        if (! empty($validated['current_location_note'])) {
            $payload['current_location_note'] = $validated['current_location_note'];
            $payload['location_updated_at'] = now();
        }

        if (isset($validated['current_latitude'], $validated['current_longitude'])) {
            $payload['current_latitude'] = $validated['current_latitude'];
            $payload['current_longitude'] = $validated['current_longitude'];
            $payload['location_updated_at'] = now();
        }

        if ($target === 'shipped' && empty($payload['tracking_number'])) {
            return back()->with('error', 'Nomor resi wajib diisi saat menandai pesanan dikirim.');
        }

        foreach (['packed' => 'packed_at', 'shipped' => 'shipped_at', 'delivered' => 'delivered_at'] as $state => $column) {
            $stateIndex = array_search($state, self::SHIPPING_FLOW, true);

            if ($targetIndex >= $stateIndex && !$transaction->{$column}) {
                $payload[$column] = now();
            }
        }

        $transaction->update($payload);

        return back()->with('success', "Status pengiriman pesanan #{$transaction->id} menjadi {$target}.");
    }

    /**
     * Batalkan pesanan dan kembalikan stok.
     */
    public function destroy(Transaction $transaction): RedirectResponse
    {
        if ($transaction->status === 'paid') {
            return back()->with('error', 'Pesanan yang sudah dibayar tidak bisa dihapus.');
        }

        DB::transaction(function () use ($transaction) {
            $transaction->load('details.item');

            foreach ($transaction->details as $detail) {
                if ($detail->item) {
                    $detail->item->increment('stock', (int) $detail->quantity);
                }
            }

            $transaction->details()->delete();
            $transaction->delete();
        });

        return redirect()
            ->route('transactions.index')
            ->with('success', "Pesanan #{$transaction->id} dibatalkan dan stok dikembalikan.");
    }

    public function create(): RedirectResponse
    {
        return redirect()->route('transactions.index');
    }

    public function store(Request $request): RedirectResponse
    {
        return redirect()->route('transactions.index');
    }

    public function edit(Transaction $transaction): RedirectResponse
    {
        return redirect()->route('transactions.show', $transaction);
    }

    public function update(Request $request, Transaction $transaction): RedirectResponse
    {
        return redirect()->route('transactions.show', $transaction);
    }
}

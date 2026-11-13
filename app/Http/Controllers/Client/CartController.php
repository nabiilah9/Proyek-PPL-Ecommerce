<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Item;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class CartController extends Controller
{
    /**
     * Aturan kode diskon (Rule-Based System).
     */
    private function discountRules(): array
    {
        return [
            'HEMAT10' => [
                'minimum' => 50000,
                'percentage' => 10,
                'maximum' => 20000,
            ],
            'HEMAT20' => [
                'minimum' => 100000,
                'percentage' => 20,
                'maximum' => 30000,
            ],
            'HEMAT5' => [
                'minimum' => 25000,
                'percentage' => 5,
                'maximum' => 10000,
            ],
        ];
    }

    /**
     * Menghitung diskon voucher berdasarkan aturan.
     */
    private function calculateVoucherDiscount(
        string $code,
        float $eligibleTotal
    ): float {
        $rules = $this->discountRules();

        if (!isset($rules[$code])) {
            throw new \Exception('Kode voucher tidak valid.');
        }

        $rule = $rules[$code];

        if ($eligibleTotal < $rule['minimum']) {
            throw new \Exception(
                'Minimal belanja untuk voucher ' . $code .
                ' adalah Rp' .
                number_format($rule['minimum'], 0, ',', '.') . '.'
            );
        }

        return min(
            $eligibleTotal * ($rule['percentage'] / 100),
            $rule['maximum']
        );
    }

    /**
     * Menampilkan halaman keranjang.
     */
    public function index()
    {
        $cartItems = session('cart', []);

        $items = [];
        $subtotal = 0;
        $discount = 0;

        foreach ($cartItems as $itemId => $quantity) {
            $item = Item::with('category')->find($itemId);

            if (!$item) {
                continue;
            }

            $quantity = (int) $quantity;

            $itemTotal = (float) $item->price * $quantity;
            $itemDiscount = $itemTotal * (
                (float) $item->discount / 100
            );

            $items[] = [
                'id' => $item->id,
                'name' => $item->name,
                'price' => (float) $item->price,
                'quantity' => $quantity,
                'unit' => $item->unit,
                'discount' => (float) $item->discount,
                'total' => (int) round($itemTotal),
                'discounted_total' => $itemTotal - $itemDiscount,
            ];

            $subtotal += $itemTotal;
            $discount += $itemDiscount;
        }

        // Ongkir sementara gratis.
        $shipping = 0;

        // Total setelah diskon produk.
        $eligibleTotal = max(0, $subtotal - $discount);

        // Periksa voucher yang sedang digunakan.
        $voucher = session('applied_voucher');
        $voucherDiscount = 0;

        if ($voucher) {
            try {
                $voucherDiscount = $this->calculateVoucherDiscount(
                    $voucher['code'],
                    $eligibleTotal
                );

                // Perbarui nilai diskon di session.
                $voucher['discount'] = (int) round($voucherDiscount);

                session(['applied_voucher' => $voucher]);
            } catch (\Exception $e) {
                session()->forget('applied_voucher');
                $voucher = null;
                $voucherDiscount = 0;
            }
        }

        $total = max(
            0,
            $eligibleTotal - $voucherDiscount + $shipping
        );

        return Inertia::render('clients/Cart', [
            'items' => $items,
            'subtotal' => $subtotal,
            'discount' => $discount,
            'shipping' => $shipping,
            'voucher' => $voucher,
            'voucherDiscount' => (int) round($voucherDiscount),
            'total' => (int) round($total),
        ]);
    }

    /**
     * Menambahkan produk ke keranjang.
     */
    public function addToCart(Request $request)
    {
        $validated = $request->validate([
            'item_id' => [
                'required',
                'integer',
                'exists:items,id',
            ],
            'quantity' => [
                'required',
                'integer',
                'min:1',
            ],
        ]);

        $cart = session('cart', []);

        $itemId = (int) $validated['item_id'];
        $quantity = (int) $validated['quantity'];

        if (isset($cart[$itemId])) {
            $cart[$itemId] += $quantity;
        } else {
            $cart[$itemId] = $quantity;
        }

        session(['cart' => $cart]);

        return back()->with(
            'success',
            'Item berhasil ditambahkan ke keranjang!'
        );
    }

    /**
     * Mengubah jumlah produk di keranjang.
     */
    public function updateCart(Request $request)
    {
        $validated = $request->validate([
            'item_id' => [
                'required',
                'integer',
                'exists:items,id',
            ],
            'quantity' => [
                'required',
                'integer',
                'min:0',
            ],
        ]);

        $cart = session('cart', []);

        $itemId = (int) $validated['item_id'];
        $quantity = (int) $validated['quantity'];

        if ($quantity > 0) {
            $cart[$itemId] = $quantity;
        } else {
            unset($cart[$itemId]);
        }

        session(['cart' => $cart]);

        return back()->with(
            'success',
            'Keranjang berhasil diperbarui!'
        );
    }

    /**
     * Menghapus produk dari keranjang.
     */
    public function removeFromCart(Request $request)
    {
        $validated = $request->validate([
            'item_id' => [
                'required',
                'integer',
                'exists:items,id',
            ],
        ]);

        $cart = session('cart', []);

        unset($cart[(int) $validated['item_id']]);

        session(['cart' => $cart]);

        return back()->with(
            'success',
            'Item berhasil dihapus dari keranjang!'
        );
    }

    /**
     * Mengambil jumlah item dan total harga keranjang.
     */
    public function getCartCount()
    {
        $cart = session('cart', []);

        $count = 0;
        $total = 0;

        foreach ($cart as $itemId => $quantity) {
            $item = Item::find($itemId);

            if (!$item) {
                continue;
            }

            $quantity = (int) $quantity;
            $count += $quantity;

            $itemTotal = (float) $item->price * $quantity;
            $itemDiscount = $itemTotal * (
                (float) $item->discount / 100
            );

            $total += $itemTotal - $itemDiscount;
        }

        $voucher = session('applied_voucher');

        if ($voucher && $count > 0) {
            try {
                $voucherDiscount = $this->calculateVoucherDiscount(
                    $voucher['code'],
                    $total
                );

                $total -= $voucherDiscount;
            } catch (\Exception $e) {
                session()->forget('applied_voucher');
            }
        }

        return response()->json([
            'count' => $count,
            'total' => max(0, $total),
        ]);
    }

    /**
     * Menerapkan kode voucher diskon.
     */
    public function applyDiscount(Request $request)
    {
        $validated = $request->validate([
            'code' => [
                'required',
                'string',
                'max:50',
            ],
        ]);

        $code = strtoupper(trim($validated['code']));
        $rules = $this->discountRules();

        if (!isset($rules[$code])) {
            return back()->withErrors([
                'code' => 'Kode voucher tidak valid.',
            ]);
        }

        $cart = session('cart', []);

        if (empty($cart)) {
            return back()->withErrors([
                'code' => 'Keranjang masih kosong.',
            ]);
        }

        $subtotal = 0;
        $productDiscount = 0;

        foreach ($cart as $itemId => $quantity) {
            $item = Item::find($itemId);

            if (!$item) {
                continue;
            }

            $itemTotal = (float) $item->price * (int) $quantity;

            $itemDiscount = $itemTotal * (
                (float) $item->discount / 100
            );

            $subtotal += $itemTotal;
            $productDiscount += $itemDiscount;
        }

        $eligibleTotal = max(0, $subtotal - $productDiscount);

        try {
            $voucherDiscount = $this->calculateVoucherDiscount(
                $code,
                $eligibleTotal
            );

            session([
                'applied_voucher' => [
                    'code' => $code,
                    'discount' => (int) round($voucherDiscount),
                ],
            ]);

            return back()->with(
                'success',
                'Voucher ' . $code . ' berhasil digunakan!'
            );
        } catch (\Exception $e) {
            return back()->withErrors([
                'code' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Menghapus voucher yang sedang digunakan.
     */
    public function removeDiscount()
    {
        session()->forget('applied_voucher');

        return back()->with(
            'success',
            'Voucher berhasil dihapus.'
        );
    }

    /**
     * Checkout keranjang.
     */
    public function checkout(Request $request)
    {
        if (!Auth::check()) {
            return redirect()
                ->route('login')
                ->with(
                    'error',
                    'Silakan login terlebih dahulu.'
                );
        }

        $validated = $request->validate([
            'payment_method' => [
                'required',
                'string',
                'in:cash,bank,e-wallet',
            ],
            'note' => [
                'nullable',
                'string',
                'max:1000',
            ],
        ]);

        $cart = session('cart', []);

        if (empty($cart)) {
            return back()->with(
                'error',
                'Keranjang masih kosong.'
            );
        }

        try {
            $rules = $this->discountRules();
            $voucher = session('applied_voucher');

            $transaction = DB::transaction(function () use (
                $cart,
                $validated,
                $rules,
                $voucher
            ) {
                $subtotal = 0;
                $discount = 0;
                $transactionItems = [];

                /*
                 * Periksa produk dan stok.
                 */
                foreach ($cart as $itemId => $quantity) {
                    $quantity = (int) $quantity;

                    if ($quantity < 1) {
                        throw new \Exception(
                            'Jumlah produk tidak valid.'
                        );
                    }

                    $item = Item::where('id', $itemId)
                        ->lockForUpdate()
                        ->first();

                    if (!$item) {
                        throw new \Exception(
                            "Produk dengan ID {$itemId} tidak ditemukan."
                        );
                    }

                    $stock = (int) $item->stock;

                    if ($stock < $quantity) {
                        throw new \Exception(
                            "Stok {$item->name} tidak mencukupi. " .
                            "Stok tersedia: {$stock}, " .
                            "jumlah yang dipesan: {$quantity}."
                        );
                    }

                    $price = (float) $item->price;
                    $itemTotal = $price * $quantity;

                    $itemDiscount = $itemTotal * (
                        (float) $item->discount / 100
                    );

                    $transactionItems[] = [
                        'item' => $item,
                        'quantity' => $quantity,
                        'price_at_time' => $price,
                    ];

                    $subtotal += $itemTotal;
                    $discount += $itemDiscount;
                }

                /*
                 * Hitung total setelah diskon produk.
                 */
                $shipping = 0;
                $eligibleTotal = max(0, $subtotal - $discount);

                /*
                 * Terapkan voucher jika ada.
                 */
                $voucherDiscount = 0;

                if ($voucher) {
                    $code = strtoupper($voucher['code']);

                    if (!isset($rules[$code])) {
                        throw new \Exception(
                            'Kode voucher tidak valid.'
                        );
                    }

                    $rule = $rules[$code];

                    if ($eligibleTotal < $rule['minimum']) {
                        throw new \Exception(
                            'Minimal belanja untuk voucher tidak terpenuhi.'
                        );
                    }

                    $voucherDiscount = min(
                        $eligibleTotal * (
                            $rule['percentage'] / 100
                        ),
                        $rule['maximum']
                    );
                }

                $total = max(
                    0,
                    $eligibleTotal - $voucherDiscount + $shipping
                );

                /*
                 * Simpan transaksi.
                 */
                $transaction = Transaction::create([
                    'client_id' => Auth::id(),
                    'total' => $total,
                    'note' => $validated['note'] ?? null,
                    'payment_method' => $validated['payment_method'],
                    'status' => 'pending',
                ]);

                /*
                 * Simpan detail transaksi dan kurangi stok.
                 */
                foreach ($transactionItems as $transactionItem) {
                    $item = $transactionItem['item'];
                    $quantity = $transactionItem['quantity'];
                    $price = $transactionItem['price_at_time'];

                    TransactionDetail::create([
                        'transaction_id' => $transaction->id,
                        'item_id' => $item->id,
                        'quantity' => $quantity,
                        'price_at_time' => $price,
                    ]);

                    $item->decrement('stock', $quantity);
                }

                return $transaction;
            });

            /*
             * Kosongkan keranjang dan voucher setelah transaksi berhasil.
             */
            session()->forget([
                'cart',
                'applied_voucher',
            ]);

            /*
             * Arahkan ke halaman konfirmasi pesanan.
             */
            return redirect()
                ->route('client.orders.show', [
                    'transaction' => $transaction->id,
                ])
                ->with(
                    'success',
                    'Pesanan berhasil dibuat.'
                );
        } catch (\Throwable $e) {
            Log::error('CHECKOUT ERROR', [
                'user_id' => Auth::id(),
                'payment_method' => $request->payment_method,
                'cart' => $cart,
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);

            return back()->withErrors([
                'checkout' => 'Checkout gagal: ' . $e->getMessage(),
            ]);
        }
    }
}

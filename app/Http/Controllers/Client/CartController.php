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
use App\Services\CouponService;
use App\Services\RajaOngkirService;


class CartController extends Controller
{
    /**
     * Menampilkan halaman keranjang.
     */
    public function index(CouponService $couponService)
    {
        $cartItems = session('cart', []);

        $items = [];
        $subtotal = 0;
        $discount = 0;
        $contact = Auth::user()->contact;

        if (!empty($cartItems)) {

            foreach ($cartItems as $itemId => $quantity) {

                $item = Item::with('category')->find($itemId);

                if (!$item) {
                    continue;
                }

                $quantity = (int) $quantity;

                $itemTotal = (float) $item->price * $quantity;

                $itemDiscount =
                    $itemTotal * ((float) $item->discount / 100);

                $items[] = [
                    'id' => $item->id,
                    'name' => $item->name,
                    'price' => (float) $item->price,
                    'quantity' => $quantity,
                    'unit' => $item->unit,
                    'discount' => (float) $item->discount,
                    'total' => (int) round($itemTotal),
                    'discounted_total' =>
                        $itemTotal - $itemDiscount,
                ];

                $subtotal += $itemTotal;
                $discount += $itemDiscount;
            }
        }

        // Ongkir sementara gratis
        $shipping = 0;

        // PPL-10: kode diskon dengan Rule-Based System.
        $eligibleTotal = max(0, $subtotal - $discount);
        $appliedCoupon = $couponService->tryEvaluate(
            session('coupon_code'),
            $eligibleTotal
        );
        $couponDiscount = $appliedCoupon['discount'] ?? 0;

        $total = $eligibleTotal - $couponDiscount + $shipping;

        return Inertia::render('clients/Cart', [
            'items' => $items,
            'subtotal' => $subtotal,
            'discount' => $discount,
            'shipping' => $shipping,
            'total' => $total,

            // Data nama dan nomor telepon penerima
            'prefill' => [
                'name' => $contact?->name ?? Auth::user()->name,
                'phone' => $contact?->phone ?? '',
            ],

            // PPL-10
            'coupon' => $appliedCoupon ? [
                'code' => $appliedCoupon['coupon']->code,
                'description' => $appliedCoupon['coupon']->description,
            ] : null,
            'couponDiscount' => $couponDiscount,

            // Lokasi pengiriman pilihan pembeli (header "Change Location")
            'clientLocation' => session('client_location'),
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
        $item = Item::find($itemId);

        if (! $item || ! (bool) $item->is_available) {
            return back()->with('error', 'Produk tidak tersedia.');
        }

        if (isset($cart[$itemId])) {
            $cart[$itemId] += $quantity;
        } else {
            $cart[$itemId] = $quantity;
        }

        if ($cart[$itemId] > (int) $item->stock) {
            return back()->with(
                'error',
                'Stok tersedia hanya ' . (int) $item->stock . ' ' . $item->unit . '.'
            );
        }

        session([
            'cart' => $cart,
        ]);

        return back()->with(
            'success',
            'Item added to cart successfully!'
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
        $item = Item::find($itemId);

        if (! $item || ! (bool) $item->is_available) {
            unset($cart[$itemId]);
            session(['cart' => $cart]);

            return back()->with('error', 'Produk tidak tersedia.');
        }

        if ($quantity > (int) $item->stock) {
            return back()->with(
                'error',
                'Stok tersedia hanya ' . (int) $item->stock . ' ' . $item->unit . '.'
            );
        }

        if ($quantity > 0) {
            $cart[$itemId] = $quantity;
        } else {
            unset($cart[$itemId]);
        }

        session([
            'cart' => $cart,
        ]);

        return back()->with(
            'success',
            'Cart updated successfully!'
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

        session([
            'cart' => $cart,
        ]);

        return back()->with(
            'success',
            'Item removed from cart successfully!'
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

            $itemTotal =
                (float) $item->price * $quantity;

            $itemDiscount =
                $itemTotal *
                ((float) $item->discount / 100);

            $total +=
                $itemTotal - $itemDiscount;
        }

        return response()->json([
            'count' => $count,
            'total' => $total,
        ]);
    }


    /**
     * PPL-10: terapkan kode diskon ke keranjang (disimpan di session).
     */
    public function applyCoupon(Request $request, CouponService $couponService)
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:30'],
        ], [
            'code.required' => 'Masukkan kode diskon dulu.',
        ]);

        $cart = session('cart', []);

        if (empty($cart)) {
            return back()->with('error', 'Keranjang masih kosong.');
        }

        // Hitung subtotal setelah diskon produk.
        $eligibleTotal = 0;

        foreach ($cart as $itemId => $quantity) {
            $item = Item::find($itemId);

            if (!$item) {
                continue;
            }

            $line = (float) $item->price * (int) $quantity;
            $eligibleTotal += $line - ($line * ((float) $item->discount / 100));
        }

        try {
            $result = $couponService->evaluate($validated['code'], $eligibleTotal);
        } catch (\RuntimeException $e) {
            session()->forget('coupon_code');

            return back()->with('error', $e->getMessage());
        }

        session(['coupon_code' => $result['coupon']->code]);

        return back()->with(
            'success',
            'Kode ' . $result['coupon']->code . ' dipakai. Potongan Rp '
            . number_format($result['discount'], 0, ',', '.') . '.'
        );
    }

    /**
     * PPL-10: lepas kode diskon dari keranjang.
     */
    public function removeCoupon()
    {
        session()->forget('coupon_code');

        return back()->with('success', 'Kode diskon dilepas.');
    }

    /**
     * Checkout keranjang.
     */
    public function checkout(
        Request $request,
        RajaOngkirService $rajaOngkir,
        CouponService $couponService
    ) {
        /*
        |--------------------------------------------------------------------------
        | VALIDASI REQUEST
        |--------------------------------------------------------------------------
        */
        $phone = preg_replace('/[^\d+]/', '', (string) $request->input('recipient_phone'));
        $request->merge(['recipient_phone' => $phone === '' ? null : $phone]);
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
            'delivery_method' => ['required', 'in:delivery,pickup'],
            'recipient_name' => ['required_if:delivery_method,delivery', 'nullable', 'string', 'max:100'],
            'recipient_phone' => ['required_if:delivery_method,delivery', 'nullable', 'regex:/^\+?\d{5,15}$/'],
            'street' => ['required_if:delivery_method,delivery', 'nullable', 'string', 'max:200'],
            'destination_id' => ['required_if:delivery_method,delivery', 'nullable', 'integer', 'min:1'],
            'destination_label' => ['required_if:delivery_method,delivery', 'nullable', 'string', 'max:255'],
            'courier' => ['required_if:delivery_method,delivery', 'nullable', 'string', 'max:20'],
            'service' => ['required_if:delivery_method,delivery', 'nullable', 'string', 'max:50'],
        ], [
            'recipient_phone.regex'       => 'Nomor telepon tidak valid. Contoh: 081234567890.',
            'recipient_phone.required_if' => 'Nomor telepon wajib diisi untuk pengiriman.',
            'destination_id.required_if'  => 'Kota tujuan wajib dipilih untuk pengiriman.',
            'courier.required_if'         => 'Kurir wajib dipilih untuk pengiriman.',
            'service.required_if'         => 'Layanan kurir wajib dipilih untuk pengiriman.',
        ]);


        /*
        |--------------------------------------------------------------------------
        | CEK USER
        |--------------------------------------------------------------------------
        */

        if (!Auth::check()) {

            return redirect()
                ->route('login')
                ->with(
                    'error',
                    'Silakan login terlebih dahulu.'
                );
        }


        /*
        |--------------------------------------------------------------------------
        | AMBIL CART
        |--------------------------------------------------------------------------
        */

        $cart = session('cart', []);

        if (empty($cart)) {

            return back()->with(
                'error',
                'Keranjang masih kosong.'
            );
        }


        // HITUNG ONGKIR DI SERVER
        $shippingData = [
            'delivery_method' => 'pickup',
            'shipping_cost' => 0,
        ];

        if ($validated['delivery_method'] === 'delivery') {
            try {
                $option = $rajaOngkir->findOption(
                    (int) $validated['destination_id'],
                    $rajaOngkir->weightOf($cart),
                    $validated['courier'],
                    $validated['service'],
                );
            } catch (\Throwable $e) {
                Log::error('RAJAONGKIR ERROR', [
                    'message' => $e->getMessage(),
                ]);

                return back()->withErrors([
                    'checkout' => 'Ongkos kirim tidak dapat dihitung, coba lagi.',
                ]);
            }

            if (!$option) {
                return back()->withErrors([
                    'checkout' => 'Layanan pengiriman tidak tersedia untuk tujuan ini.',
                ]);
            }

            $shippingData = [
                'delivery_method' => 'delivery',
                'recipient_name' => $validated['recipient_name'],
                'recipient_phone' => $validated['recipient_phone'],
                'shipping_address' => $validated['street'] . ', ' . $validated['destination_label'],
                'shipping_destination_id' => (int) $validated['destination_id'],
                'shipping_courier' => strtoupper($option['courier']),
                'shipping_service' => $option['service'],
                'shipping_etd' => $option['etd'],
                'shipping_cost' => (int) $option['cost'],
            ];
        }



        /*
        |--------------------------------------------------------------------------
        | PROSES TRANSAKSI
        |--------------------------------------------------------------------------
        */

        try {

            $transaction = DB::transaction(function () use ($cart, $validated, $shippingData, $couponService) {

                $subtotal = 0;
                $discount = 0;

                $transactionItems = [];


                /*
                |--------------------------------------------------------------------------
                | CEK SEMUA PRODUK DAN STOK
                |--------------------------------------------------------------------------
                */

                foreach ($cart as $itemId => $quantity) {

                    $quantity = (int) $quantity;

                    if ($quantity < 1) {
                        throw new \Exception(
                            'Jumlah produk tidak valid.'
                        );
                    }


                    /*
                    |--------------------------------------------------------------------------
                    | LOCK PRODUK
                    |--------------------------------------------------------------------------
                    |
                    | Menghindari stok berubah bersamaan saat checkout.
                    |
                    */

                    $item = Item::where(
                        'id',
                        $itemId
                    )
                        ->lockForUpdate()
                        ->first();


                    if (!$item) {

                        throw new \Exception(
                            "Produk dengan ID {$itemId} tidak ditemukan."
                        );
                    }


                    /*
                    |--------------------------------------------------------------------------
                    | CEK STOK
                    |--------------------------------------------------------------------------
                    */

                    $stock = (int) $item->stock;

                    if ($stock < $quantity) {

                        throw new \Exception(
                            "Stok {$item->name} tidak mencukupi. " .
                            "Stok tersedia: {$stock}, " .
                            "jumlah yang dipesan: {$quantity}."
                        );
                    }


                    /*
                    |--------------------------------------------------------------------------
                    | HITUNG HARGA
                    |--------------------------------------------------------------------------
                    */

                    $price = (float) $item->price;

                    $itemTotal =
                        $price * $quantity;

                    $itemDiscount =
                        $itemTotal *
                        ((float) $item->discount / 100);


                    /*
                    |--------------------------------------------------------------------------
                    | SIMPAN DATA ITEM UNTUK TRANSAKSI
                    |--------------------------------------------------------------------------
                    */

                    $transactionItems[] = [
                        'item' => $item,
                        'quantity' => $quantity,
                        'price_at_time' => $price,
                    ];


                    $subtotal += $itemTotal;
                    $discount += $itemDiscount;
                }


                /*
                |--------------------------------------------------------------------------
                | HITUNG TOTAL
                |--------------------------------------------------------------------------
                */

                $shipping = (int) $shippingData['shipping_cost'];

                // PPL-10: kode diskon dievaluasi ulang di server saat checkout.
                $appliedCoupon = null;
                $couponDiscount = 0;

                if (session('coupon_code')) {
                    $appliedCoupon = $couponService->evaluate(
                        session('coupon_code'),
                        max(0, $subtotal - $discount)
                    );

                    $couponDiscount = $appliedCoupon['discount'];
                }

                $total =
                    $subtotal -
                    $discount -
                    $couponDiscount +
                    $shipping;


                /*
                |--------------------------------------------------------------------------
                | BUAT TRANSAKSI
                |--------------------------------------------------------------------------
                */

                $transaction = Transaction::create([
                    'client_id' => Auth::id(),
                    'total' => $total,
                    'note' => $validated['note'] ?? null,
                    'payment_method' =>
                        $validated['payment_method'],
                    'status' => 'pending',
                    'delivery_method' => $shippingData['delivery_method'],
                    'recipient_name' => $shippingData['recipient_name'] ?? null,
                    'recipient_phone' => $shippingData['recipient_phone'] ?? null,
                    'shipping_address' => $shippingData['shipping_address'] ?? null,
                    'shipping_destination_id' => $shippingData['shipping_destination_id'] ?? null,
                    'shipping_courier' => $shippingData['shipping_courier'] ?? null,
                    'shipping_service' => $shippingData['shipping_service'] ?? null,
                    'shipping_etd' => $shippingData['shipping_etd'] ?? null,
                    'shipping_cost' => $shippingData['shipping_cost'],
                    'coupon_id' => $appliedCoupon['coupon']->id ?? null,
                    'coupon_code' => $appliedCoupon['coupon']->code ?? null,
                    'coupon_discount' => $couponDiscount,
                ]);

                if ($appliedCoupon) {
                    $appliedCoupon['coupon']->increment('used_count');
                }


                /*
                |--------------------------------------------------------------------------
                | BUAT DETAIL TRANSAKSI
                |--------------------------------------------------------------------------
                */

                foreach ($transactionItems as $transactionItem) {

                    $item =
                        $transactionItem['item'];

                    $quantity =
                        $transactionItem['quantity'];

                    $price =
                        $transactionItem['price_at_time'];


                    TransactionDetail::create([
                        'transaction_id' =>
                            $transaction->id,

                        'item_id' =>
                            $item->id,

                        'quantity' =>
                            $quantity,

                        'price_at_time' =>
                            $price,
                    ]);


                    /*
                    |--------------------------------------------------------------------------
                    | KURANGI STOK
                    |--------------------------------------------------------------------------
                    */

                    $item->decrement(
                        'stock',
                        $quantity
                    );
                }


                return $transaction;
            });


            /*
            |--------------------------------------------------------------------------
            | KOSONGKAN CART
            |--------------------------------------------------------------------------
            */

            session()->forget(['cart', 'coupon_code']);


            /*
            |--------------------------------------------------------------------------
            | REDIRECT KE ORDER CONFIRMATION
            |--------------------------------------------------------------------------
            */

            return redirect()
                ->route(
                    'client.orders.show',
                    [
                        'transaction' =>
                            $transaction->id,
                    ]
                )
                ->with(
                    'success',
                    'Pesanan berhasil dibuat.'
                );


        } catch (\Throwable $e) {

            /*
            |--------------------------------------------------------------------------
            | CATAT ERROR KE LARAVEL LOG
            |--------------------------------------------------------------------------
            */

            Log::error(
                'CHECKOUT ERROR',
                [
                    'user_id' => Auth::id(),
                    'payment_method' =>
                        $request->payment_method,
                    'cart' => $cart,
                    'message' => $e->getMessage(),
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                ]
            );


            /*
            |--------------------------------------------------------------------------
            | KEMBALI KE CART DENGAN ERROR
            |--------------------------------------------------------------------------
            */

            return back()->withErrors([
                'checkout' =>
                    'Checkout gagal: ' .
                    $e->getMessage(),
            ]);
        }
    }
}
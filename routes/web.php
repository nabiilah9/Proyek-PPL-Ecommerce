<?php

use App\Http\Controllers\Admin\AdminAddressController;
use App\Http\Controllers\Admin\AdminCategoryController;
use App\Http\Controllers\Admin\AdminContactController;
use App\Http\Controllers\Admin\AdminItemController;
use App\Http\Controllers\Admin\AdminRatingController;
use App\Http\Controllers\Admin\AdminTransactionController;
use App\Http\Controllers\Admin\AdminTransactionDetailController;
use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\Client\CartController;
use App\Http\Controllers\Client\ProfileControllerClient;
use App\Http\Controllers\Client\PaymentController;
use App\Http\Controllers\Client\OrderReceiptController;
use App\Http\Controllers\Client\OrderTrackingController;
use App\Http\Controllers\Client\LocationController;
use App\Http\Controllers\MidtransNotificationController;
use App\Http\Controllers\Client\ProductController;
use App\Http\Controllers\Client\ShippingController;
use App\Services\MidtransService;
use App\Models\Category;
use App\Models\Coupon;
use App\Models\Item;
use App\Models\Transaction;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| HALAMAN UTAMA
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    return redirect()->route('login');
})->name('landing.page');

/*
|--------------------------------------------------------------------------
| HALAMAN UMUM
|--------------------------------------------------------------------------
*/

Route::get('/offers', function () {
    $coupons = Coupon::query()
        ->where('is_active', true)
        ->where(fn ($q) => $q->whereNull('starts_at')->orWhere('starts_at', '<=', now()))
        ->where(fn ($q) => $q->whereNull('ends_at')->orWhere('ends_at', '>=', now()))
        ->where(fn ($q) => $q->whereNull('usage_limit')->orWhereColumn('used_count', '<', 'usage_limit'))
        ->orderBy('code')
        ->get(['id', 'code', 'description', 'type', 'value', 'min_spend', 'max_discount', 'ends_at']);

    return Inertia::render('offers', [
        'coupons' => $coupons,
    ]);
});

Route::get('/order', function () {
    return Inertia::render('order');
});

Route::get('/Homepage', function (\App\Services\ProductScoringService $scoring) {
    $items = Item::with('category')
        ->where('is_available', true)
        ->where('stock', '>', 0)
        ->get();

    $categories = Category::orderBy('name')->get();

    // PPL-07: rekomendasi terlaris hasil perhitungan skor.
    $bestSellers = $scoring->bestSellers(6)->map(fn (array $row) => [
        'id' => $row['item']->id,
        'name' => $row['item']->name,
        'slug' => $row['item']->slug ?? null,
        'price' => (float) $row['item']->price,
        'discount' => (float) $row['item']->discount,
        'image_url' => $row['item']->image_url,
        'unit' => $row['item']->unit,
        'category' => $row['item']->category?->name,
        'score' => $row['score'],
        'sold' => $row['sold'],
        'rating' => $row['rating'],
        'reviews' => $row['reviews'],
    ])->values();

    return Inertia::render('Homepage', [
        'items' => $items,
        'categories' => $categories,
        'bestSellers' => $bestSellers,
    ]);
})->name('Homepage');

Route::get('/Delivery', function () {
    return Inertia::render('Delivery');
});

/*
|--------------------------------------------------------------------------
| MENU / PRODUK
|--------------------------------------------------------------------------
*/

Route::get('/menu', [CategoryController::class, 'index']);
Route::get('/menu/{slug}', [CategoryController::class, 'show']);

Route::get('/produk/{item}', [
    ProductController::class,
    'show',
])->name('produk.show');

/*
|--------------------------------------------------------------------------
| PESANAN SAYA
|--------------------------------------------------------------------------
*/

Route::middleware(['auth'])->group(function () {
    Route::get('/pesanan-saya', function (MidtransService $midtrans) {
        Transaction::where('client_id', Auth::id())
            ->where('status', 'pending')
            ->whereIn('payment_method', ['bank', 'e-wallet'])
            ->whereNotNull('midtrans_order_id')
            ->get()
            ->each(fn(Transaction $transaction) => $midtrans->refreshStatus($transaction));

        $transactions = Transaction::with([
            'details.item',
            'ratings',
        ])
            ->where('client_id', Auth::id())
            ->latest()
            ->get();

        return Inertia::render('PesananSaya', [
            'transactions' => $transactions,
            'user' => Auth::user(),
        ]);
    })->name('pesanan.saya');
});

/*
|--------------------------------------------------------------------------
| WEBHOOK MIDTRANS (tanpa auth, dipanggil server Midtrans)
|--------------------------------------------------------------------------
*/

Route::post('/midtrans/notification', [
    MidtransNotificationController::class,
    'handle',
])->name('midtrans.notification');


/*
|--------------------------------------------------------------------------
| USER YANG SUDAH LOGIN
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'verified'])->group(function () {

    /*
    |--------------------------------------------------------------------------
    | USER HOME
    |--------------------------------------------------------------------------
    */

    Route::prefix('user')->group(function () {
        Route::get('/', function () {
            return Inertia::render('clients/welcome');
        })->name('home');
    });

    /*
    |--------------------------------------------------------------------------
    | PROFILE
    |--------------------------------------------------------------------------
    */

    Route::get('/profile', [
        ProfileControllerClient::class,
        'show',
    ])->name('profile.show');

    Route::post('/profile', [
        ProfileControllerClient::class,
        'update',
    ])->name('profile.update');

    /*
    |--------------------------------------------------------------------------
    | CLIENT / CART / CHECKOUT
    |--------------------------------------------------------------------------
    */

    Route::prefix('client')
        ->name('client.')
        ->group(function () {

            // CART
            Route::get('/cart', [
                CartController::class,
                'index',
            ])->name('cart.index');

            // TAMBAH KE CART
            Route::post('/cart/add', [
                CartController::class,
                'addToCart',
            ])->name('cart.add');

            // UPDATE CART
            Route::patch('/cart/update', [
                CartController::class,
                'updateCart',
            ])->name('cart.update');

            // HAPUS CART
            Route::delete('/cart/remove', [
                CartController::class,
                'removeFromCart',
            ])->name('cart.remove');

            // CHECKOUT
            // PPL-10: kode diskon (Rule-Based System)
            Route::post('/cart/coupon', [CartController::class, 'applyCoupon'])
                ->name('cart.coupon.apply');

            Route::delete('/cart/coupon', [CartController::class, 'removeCoupon'])
                ->name('cart.coupon.remove');

            Route::post('/cart/checkout', [
                CartController::class,
                'checkout',
            ])->name('cart.checkout');

            // JUMLAH ITEM CART
            Route::get('/cart/count', [
                CartController::class,
                'getCartCount',
            ])->name('cart.count');

            Route::get('/shipping/destinations', [ShippingController::class, 'destinations'])
                ->middleware('throttle:30,1')->name('shipping.destinations');

            Route::post('/shipping/cost', [ShippingController::class, 'cost'])
                ->middleware('throttle:20,1')->name('shipping.cost');

            // LOKASI PENGIRIMAN (header "Change Location")
            Route::post('/location', [LocationController::class, 'update'])
                ->name('location.update');

            Route::delete('/location', [LocationController::class, 'reset'])
                ->name('location.reset');

            Route::get('/location/search', [LocationController::class, 'search'])
                ->middleware('throttle:30,1')->name('location.search');

            /*
            |--------------------------------------------------------------------------
            | KONFIRMASI PESANAN
            |--------------------------------------------------------------------------
            | URL: /client/orders/{transaction}
            | File: resources/js/pages/clients/OrderConfirmation.tsx
            */
            Route::post('/orders/{transaction}/cancel', [PaymentController::class, 'cancel'])
                ->name('orders.cancel');

            Route::post('/orders/{transaction}/pay', [PaymentController::class, 'token'])
                ->name('orders.pay');

            // Cek status pembayaran (polling setelah bayar via DANA/e-wallet)
            Route::get('/orders/{transaction}/status', [PaymentController::class, 'status'])
                ->name('orders.status');

            // LACAK PAKET
            Route::get('/orders/{transaction}/tracking', [OrderTrackingController::class, 'show'])
                ->name('orders.tracking');

            // KONFIRMASI PESANAN DITERIMA
            Route::post('/orders/{transaction}/received', [
                OrderReceiptController::class,
                'confirm',
            ])->name('orders.received');

            // SIMPAN RATING DAN ULASAN PRODUK
            Route::post('/orders/{transaction}/items/{item}/rating', [
                OrderReceiptController::class,
                'storeRating',
            ])->name('orders.rating.store');

            // DETAIL PESANAN DAN PEMBAYARAN
            Route::get('/orders/{transaction}', function (
                Transaction $transaction,
                MidtransService $midtrans,
            ) {
                abort_unless(
                    (int) $transaction->client_id === (int) Auth::id(),
                    403
                );

                $transaction = $midtrans->refreshStatus($transaction);

                return Inertia::render('clients/OrderConfirmation', [
                    'transactionId' => $transaction->id,
                    'status' => $transaction->status,
                    'paymentMethod' => $transaction->payment_method,
                    'total' => $transaction->total,
                ]);
            })->name('orders.show');
        });

    /*
    |--------------------------------------------------------------------------
    | ADMIN
    |--------------------------------------------------------------------------
    */

    // PPL-01/B-2: hanya ADMIN yang boleh masuk area admin.
    Route::prefix('admin')->middleware('role:ADMIN')->group(function () {

        Route::get('/', [\App\Http\Controllers\Admin\AdminDashboardController::class, 'index'])
            ->name('dashboard');

        Route::resource('users', AdminUserController::class);
        Route::resource('contacts', AdminContactController::class);
        Route::resource('address', AdminAddressController::class);
        Route::resource('transactions', AdminTransactionController::class);

        // PPL-03: verifikasi pembayaran dan update status pengiriman
        Route::post('transactions/{transaction}/verify', [AdminTransactionController::class, 'verify'])
            ->name('transactions.verify');

        Route::patch('transactions/{transaction}/shipping', [AdminTransactionController::class, 'shipping'])
            ->name('transactions.shipping');
        Route::resource('categories', AdminCategoryController::class);
        Route::resource('items', AdminItemController::class);
        Route::resource('ratings', AdminRatingController::class);
        Route::resource('details', AdminTransactionDetailController::class);
    });

    /*
    |--------------------------------------------------------------------------
    | COURIER
    |--------------------------------------------------------------------------
    */

    Route::prefix('courier')->middleware('role:COURIER,ADMIN')->group(function () {
        Route::get('/', function () {
            return response()->view('welcome');
        });
    });
});

/*
|--------------------------------------------------------------------------
| SETTINGS & AUTH
|--------------------------------------------------------------------------
*/

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';

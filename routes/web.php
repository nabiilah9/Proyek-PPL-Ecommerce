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
use Illuminate\Support\Facades\Route;

use Inertia\Inertia;

Route::get('/', function () { // routes
    return Inertia::render('welcome'); // file name
})->name('landing page'); // name for pages

Route::get('/menu', function () {
    return Inertia::render('menu');
})->name('menu');

Route::get('/offers', function () {
    return Inertia::render('offers');
});

Route::get('/order', function () {
    return Inertia::render('order');
});
Route::get('/Homepage', function () {
    return Inertia::render('Homepage');
})->name('Homepage');
Route::get('/Delivery', function () {
    return Inertia::render('Delivery');
})->name('Delivery');


Route::get('/pesanan-saya', function () {
    return Inertia::render('PesananSaya', [
        'user' => ['name' => 'Seinal Arifin'],
        'cartItems' => ['count' => 23, 'total' => 100000],
    ]);
});

// kategori-database
// Controller
Route::get('/menu', [CategoryController::class, 'index']);
Route::get('/menu/{slug}', [CategoryController::class, 'show']);


// // Closure
// Route::get('/menu', function () {
//     $categories = Category::all();
//     return Inertia::render('clients/menu', [
//         'categories' => $categories
//     ]);
// });
// Route::get('/menu/{slug}', function ($slug) {
//     $category = Category::where('slug', $slug)->firstOrFail();
//     $items = $category->items()->where('is_available', true)->get();

//     return Inertia::render('clients/kategori', [
//         'kategori' => $category->name,
//         'produk' => $items
//     ]);
// });

Route::middleware(['auth', 'verified'])->group(function () {
    Route::prefix('admin')->group(function () {
        Route::get('/', function () {
            return Inertia::render('admins/dashboard');
        })->name('dashboard');
        Route::resource('users', AdminUserController::class);
        Route::resource('contacts', AdminContactController::class);
        Route::resource('address', AdminAddressController::class);
        // Route::resource('feedbacks', AdminFeedbackController::class);
        Route::resource('transactions', AdminTransactionController::class);
        Route::resource('categories', AdminCategoryController::class);
        Route::resource('items', AdminItemController::class);
        Route::resource('ratings', AdminRatingController::class);
        Route::resource('details', AdminTransactionDetailController::class);
    });

    Route::prefix('user')->group(function () {
        Route::get('/', function () {
            return Inertia::render('clients/welcome');
        })->name('home');
    });

    Route::prefix('courier')->group(function () {
        Route::get('/', function () {
            echo "Ini halaman kurir ya cantik!";
        });
    });
    Route::middleware(['auth'])->group(function () {
        Route::get('/profile', [ProfileControllerClient::class, 'show'])->name('profile.show');
        Route::post('/profile', [ProfileControllerClient::class, 'update'])->name('profile.update');
    });

    Route::group(['as' => 'client.', 'prefix' => 'client'], function () {
        Route::get('/cart', [CartController::class, 'index'])->name('cart.index');
        Route::post('/cart/add', [CartController::class, 'addToCart'])->name('cart.add');
        Route::patch('/cart/update', [CartController::class, 'updateCart'])->name('cart.update');
        Route::delete('/cart/remove', [CartController::class, 'removeFromCart'])->name('cart.remove');
        Route::post('/cart/checkout', [CartController::class, 'checkout'])->name('cart.checkout');
        Route::get('/cart/count', [CartController::class, 'getCartCount'])->name('cart.count');
        Route::get('/orders/{transaction}', function ($transaction) {
            return Inertia::render('Client/OrderConfirmation', ['transactionId' => $transaction]);
        })->name('orders.show');
    });
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
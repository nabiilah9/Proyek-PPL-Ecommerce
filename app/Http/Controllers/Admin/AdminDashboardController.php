<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Item;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

/**
 * PPL-04 — grafik hasil penjualan pada dashboard admin.
 */
class AdminDashboardController extends Controller
{
    public function index(): Response
    {
        $paid = Transaction::query()->where('status', 'paid');

        $summary = [
            'revenue_paid' => (int) (clone $paid)->sum('total'),
            'orders_total' => Transaction::count(),
            'orders_paid' => (clone $paid)->count(),
            'orders_pending' => Transaction::where('status', 'pending')->count(),
            'orders_shipped' => Transaction::where('shipping_status', 'shipped')->count(),
            'products' => Item::count(),
            'products_low_stock' => Item::where('stock', '<=', 5)->count(),
            'customers' => User::where('role', 'CLIENT')->count(),
            'avg_rating' => round((float) DB::table('ratings')->avg('score'), 2),
        ];

        // Tren 14 hari terakhir.
        $daily = collect(range(13, 0))->map(function (int $offset) {
            $date = Carbon::today()->subDays($offset);

            $row = Transaction::query()
                ->where('status', 'paid')
                ->whereDate('created_at', $date)
                ->selectRaw('COUNT(*) as orders, COALESCE(SUM(total), 0) as revenue')
                ->first();

            return [
                'date' => $date->toDateString(),
                'label' => $date->translatedFormat('d M'),
                'orders' => (int) ($row->orders ?? 0),
                'revenue' => (int) ($row->revenue ?? 0),
            ];
        })->values();

        // Rekap 6 bulan terakhir.
        $monthly = collect(range(5, 0))->map(function (int $offset) {
            $month = Carbon::today()->startOfMonth()->subMonths($offset);
            $end = (clone $month)->endOfMonth();

            $row = Transaction::query()
                ->where('status', 'paid')
                ->whereBetween('created_at', [$month, $end])
                ->selectRaw('COUNT(*) as orders, COALESCE(SUM(total), 0) as revenue')
                ->first();

            return [
                'label' => $month->translatedFormat('M Y'),
                'orders' => (int) ($row->orders ?? 0),
                'revenue' => (int) ($row->revenue ?? 0),
            ];
        })->values();

        // Produk paling banyak terjual (transaksi dibayar).
        $topProducts = DB::table('transaction_details')
            ->join('transactions', 'transactions.id', '=', 'transaction_details.transaction_id')
            ->join('items', 'items.id', '=', 'transaction_details.item_id')
            ->where('transactions.status', 'paid')
            ->groupBy('items.id', 'items.name')
            ->selectRaw('items.id, items.name, SUM(transaction_details.quantity) as qty, SUM(transaction_details.quantity * transaction_details.price_at_time) as revenue')
            ->orderByDesc('qty')
            ->limit(5)
            ->get();

        // Penjualan per kategori.
        $byCategory = Category::query()
            ->leftJoin('items', 'items.category_id', '=', 'categories.id')
            ->leftJoin('transaction_details', 'transaction_details.item_id', '=', 'items.id')
            ->leftJoin('transactions', function ($join) {
                $join->on('transactions.id', '=', 'transaction_details.transaction_id')
                    ->where('transactions.status', '=', 'paid');
            })
            ->groupBy('categories.id', 'categories.name')
            ->selectRaw('categories.name, COALESCE(SUM(transaction_details.quantity), 0) as qty')
            ->orderByDesc('qty')
            ->get();

        return Inertia::render('admins/dashboard', [
            'summary' => $summary,
            'daily' => $daily,
            'monthly' => $monthly,
            'topProducts' => $topProducts,
            'byCategory' => $byCategory,
        ]);
    }
}

<?php

namespace App\Services;

use App\Models\Item;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * PPL-07 — rekomendasi produk terlaris dengan metode skoring.
 *
 * Skor gabungan (0-100):
 *   - 50% jumlah unit terjual (transaksi berstatus paid, 90 hari terakhir)
 *   - 30% rata-rata rating pembeli
 *   - 20% jumlah ulasan (bukti popularitas, bukan sekadar 1 ulasan tinggi)
 *
 * Setiap komponen dinormalisasi ke 0..1 terhadap nilai maksimum di katalog,
 * lalu dikalikan bobotnya. Rumus ini deterministik dan bisa dihitung ulang
 * tanpa data eksternal.
 */
class ProductScoringService
{
    public const WEIGHT_SALES = 0.5;
    public const WEIGHT_RATING = 0.3;
    public const WEIGHT_REVIEWS = 0.2;
    public const WINDOW_DAYS = 90;

    /**
     * @return Collection<int, array{item: Item, score: float, sold: int, rating: float, reviews: int}>
     */
    public function bestSellers(int $limit = 6): Collection
    {
        $since = now()->subDays(self::WINDOW_DAYS);

        $sold = DB::table('transaction_details')
            ->join('transactions', 'transactions.id', '=', 'transaction_details.transaction_id')
            ->where('transactions.status', 'paid')
            ->where('transactions.created_at', '>=', $since)
            ->groupBy('transaction_details.item_id')
            ->selectRaw('transaction_details.item_id as item_id, SUM(transaction_details.quantity) as qty')
            ->pluck('qty', 'item_id');

        $ratingRows = DB::table('ratings')
            ->groupBy('item_id')
            ->selectRaw('item_id, AVG(score) as avg_score, COUNT(*) as total')
            ->get()
            ->keyBy('item_id');

        $candidates = Item::query()
            ->with('category:id,name')
            ->where('is_available', true)
            ->where('stock', '>', 0)
            ->get();

        if ($candidates->isEmpty()) {
            return collect();
        }

        $maxSold = max(1, (int) ($sold->max() ?? 0));
        $maxReviews = max(1, (int) $ratingRows->max('total'));

        return $candidates
            ->map(function (Item $item) use ($sold, $ratingRows, $maxSold, $maxReviews) {
                $qty = (int) ($sold[$item->id] ?? 0);
                $row = $ratingRows->get($item->id);
                $avg = $row ? (float) $row->avg_score : 0.0;
                $reviews = $row ? (int) $row->total : 0;

                $score = self::WEIGHT_SALES * ($qty / $maxSold)
                    + self::WEIGHT_RATING * ($avg / 5)
                    + self::WEIGHT_REVIEWS * ($reviews / $maxReviews);

                return [
                    'item' => $item,
                    'score' => round($score * 100, 2),
                    'sold' => $qty,
                    'rating' => round($avg, 2),
                    'reviews' => $reviews,
                ];
            })
            // Produk tanpa penjualan dan tanpa ulasan tidak layak disebut terlaris.
            ->filter(fn (array $row) => $row['sold'] > 0 || $row['reviews'] > 0)
            ->sortByDesc('score')
            ->take($limit)
            ->values();
    }
}

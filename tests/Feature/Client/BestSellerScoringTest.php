<?php

namespace Tests\Feature\Client;

use App\Models\Item;
use App\Models\Rating;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use App\Models\User;
use App\Services\ProductScoringService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/**
 * PPL-07 — rekomendasi terlaris dengan metode skoring.
 */
class BestSellerScoringTest extends TestCase
{
    use RefreshDatabase;

    private function sell(Item $item, int $qty, string $status = 'paid'): void
    {
        $transaction = Transaction::factory()->create(['status' => $status]);

        TransactionDetail::factory()->create([
            'transaction_id' => $transaction->id,
            'item_id' => $item->id,
            'quantity' => $qty,
            'price_at_time' => $item->price,
        ]);
    }

    public function test_score_uses_sales_rating_and_review_weight(): void
    {
        $hot = Item::factory()->create(['is_available' => true, 'stock' => 10, 'discount' => 0]);
        $cold = Item::factory()->create(['is_available' => true, 'stock' => 10, 'discount' => 0]);

        $this->sell($hot, 10);
        $this->sell($cold, 2);

        $buyer = User::factory()->client()->create();

        Rating::create(['item_id' => $hot->id, 'user_id' => $buyer->id, 'score' => 5, 'comment' => 'enak']);
        Rating::create(['item_id' => $cold->id, 'user_id' => $buyer->id, 'score' => 3, 'comment' => 'biasa']);

        $result = app(ProductScoringService::class)->bestSellers(6);

        $this->assertSame($hot->id, $result->first()['item']->id);

        // 0.5 * 1 + 0.3 * (5/5) + 0.2 * 1 = 1.0 -> skor 100
        $this->assertSame(100.0, $result->first()['score']);
        $this->assertSame(10, $result->first()['sold']);
    }

    public function test_unpaid_transactions_do_not_count_as_sales(): void
    {
        $item = Item::factory()->create(['is_available' => true, 'stock' => 10, 'discount' => 0]);

        $this->sell($item, 5, 'pending');

        $this->assertTrue(app(ProductScoringService::class)->bestSellers(6)->isEmpty());
    }

    public function test_items_without_sales_or_reviews_are_excluded(): void
    {
        Item::factory()->create(['is_available' => true, 'stock' => 10]);

        $this->assertTrue(app(ProductScoringService::class)->bestSellers(6)->isEmpty());
    }

    public function test_homepage_receives_best_sellers(): void
    {
        $item = Item::factory()->create(['is_available' => true, 'stock' => 10, 'discount' => 0]);
        $this->sell($item, 3);

        $this->get(route('Homepage'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Homepage')
                ->has('bestSellers', 1)
                ->where('bestSellers.0.id', $item->id)
                ->has('bestSellers.0.score')
                ->has('bestSellers.0.sold')
            );
    }
}

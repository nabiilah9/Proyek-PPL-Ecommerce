<?php

namespace Tests\Feature\Admin;

use App\Models\Item;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/**
 * PPL-04 — grafik penjualan pada dashboard admin.
 */
class DashboardChartTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_exposes_sales_series(): void
    {
        $admin = User::factory()->admin()->create();
        $item = Item::factory()->create(['price' => 50000, 'discount' => 0]);

        $paid = Transaction::factory()->create(['status' => 'paid', 'total' => 100000]);
        $pending = Transaction::factory()->create(['status' => 'pending', 'total' => 999000]);

        TransactionDetail::factory()->create([
            'transaction_id' => $paid->id,
            'item_id' => $item->id,
            'quantity' => 2,
            'price_at_time' => 50000,
        ]);

        $this->actingAs($admin)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admins/dashboard')
                ->has('summary')
                ->has('daily', 14)
                ->has('monthly', 6)
                ->has('topProducts')
                ->has('byCategory')
                // Pendapatan hanya dari transaksi berstatus paid.
                ->where('summary.revenue_paid', 100000)
                ->where('summary.orders_total', 2)
                ->where('summary.orders_paid', 1)
                ->where('summary.orders_pending', 1)
                ->where('topProducts.0.id', $item->id)
                ->where('topProducts.0.qty', 2)
            );
    }

    public function test_daily_series_has_expected_shape(): void
    {
        $admin = User::factory()->admin()->create();

        $props = $this->actingAs($admin)
            ->get(route('dashboard'))
            ->viewData('page')['props'];

        $this->assertCount(14, $props['daily']);
        $this->assertArrayHasKey('label', $props['daily'][0]);
        $this->assertArrayHasKey('revenue', $props['daily'][0]);
        $this->assertArrayHasKey('orders', $props['daily'][0]);
    }
}

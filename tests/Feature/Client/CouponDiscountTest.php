<?php

namespace Tests\Feature\Client;

use App\Models\Coupon;
use App\Models\Item;
use App\Models\Transaction;
use App\Models\User;
use App\Services\CouponService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/**
 * PPL-10 — kode diskon dengan Rule-Based System.
 */
class CouponDiscountTest extends TestCase
{
    use RefreshDatabase;

    private function item(int $price = 100000): Item
    {
        return Item::factory()->create([
            'price' => $price,
            'stock' => 10,
            'discount' => 0,
            'is_available' => true,
        ]);
    }

    public function test_percent_coupon_is_capped_by_max_discount(): void
    {
        $coupon = Coupon::factory()->create([
            'code' => 'HEMAT10',
            'type' => 'percent',
            'value' => 10,
            'min_spend' => 50000,
            'max_discount' => 15000,
        ]);

        $result = app(CouponService::class)->evaluate($coupon->code, 300000);

        // 10% dari 300.000 = 30.000, dibatasi 15.000.
        $this->assertSame(15000, $result['discount']);
    }

    public function test_fixed_coupon_returns_flat_value(): void
    {
        $coupon = Coupon::factory()->create([
            'code' => 'KUEBARU',
            'type' => 'fixed',
            'value' => 20000,
        ]);

        $this->assertSame(20000, app(CouponService::class)->evaluate($coupon->code, 25000)['discount']);
    }

    public function test_min_spend_rule_blocks_small_order(): void
    {
        Coupon::factory()->create(['code' => 'MINIMAL', 'min_spend' => 100000]);

        $this->expectExceptionMessage('Minimal belanja');

        app(CouponService::class)->evaluate('MINIMAL', 50000);
    }

    public function test_expired_coupon_is_rejected(): void
    {
        Coupon::factory()->create([
            'code' => 'KADALUARSA',
            'starts_at' => now()->subMonth(),
            'ends_at' => now()->subDay(),
        ]);

        $this->expectExceptionMessage('kedaluwarsa');

        app(CouponService::class)->evaluate('KADALUARSA', 100000);
    }

    public function test_usage_limit_rule_is_enforced(): void
    {
        Coupon::factory()->create([
            'code' => 'HABIS',
            'usage_limit' => 2,
            'used_count' => 2,
        ]);

        $this->expectExceptionMessage('Kuota');

        app(CouponService::class)->evaluate('HABIS', 100000);
    }

    public function test_unknown_code_is_rejected(): void
    {
        $this->expectExceptionMessage('tidak ditemukan');

        app(CouponService::class)->evaluate('TIDAKADA', 100000);
    }

    public function test_discount_cannot_exceed_order_total(): void
    {
        Coupon::factory()->create(['code' => 'BESAR', 'type' => 'fixed', 'value' => 50000]);

        $this->assertSame(10000, app(CouponService::class)->evaluate('BESAR', 10000)['discount']);
    }

    public function test_applying_coupon_shows_discount_in_cart(): void
    {
        $user = User::factory()->client()->create();
        $item = $this->item(100000);
        $coupon = Coupon::factory()->create([
            'code' => 'HEMAT10',
            'type' => 'percent',
            'value' => 10,
            'max_discount' => 15000,
        ]);

        $this->actingAs($user)
            ->withSession(['cart' => [$item->id => 2]])
            ->post(route('client.cart.coupon.apply'), ['code' => $coupon->code])
            ->assertSessionHas('success');

        $this->actingAs($user)
            ->withSession(['cart' => [$item->id => 2], 'coupon_code' => 'HEMAT10'])
            ->get(route('client.cart.index'))
            ->assertInertia(fn (Assert $page) => $page
                ->where('couponDiscount', 15000)
                ->where('total', 185000)
            );
    }

    public function test_invalid_coupon_code_returns_error(): void
    {
        $user = User::factory()->client()->create();
        $item = $this->item();

        $this->actingAs($user)
            ->withSession(['cart' => [$item->id => 1]])
            ->post(route('client.cart.coupon.apply'), ['code' => 'NGARANG'])
            ->assertSessionHas('error');
    }

    public function test_checkout_persists_coupon_and_increments_usage(): void
    {
        $user = User::factory()->client()->create();
        $item = $this->item(100000);
        $coupon = Coupon::factory()->create([
            'code' => 'HEMAT10',
            'type' => 'percent',
            'value' => 10,
            'max_discount' => 15000,
            'usage_limit' => 5,
            'used_count' => 0,
        ]);

        $this->actingAs($user)
            ->withSession(['cart' => [$item->id => 2], 'coupon_code' => 'HEMAT10'])
            ->post(route('client.cart.checkout'), [
                'payment_method' => 'bank',
                'delivery_method' => 'pickup',
            ])
            ->assertRedirect();

        $transaction = Transaction::firstOrFail();

        $this->assertSame('HEMAT10', $transaction->coupon_code);
        $this->assertSame(15000, (int) $transaction->coupon_discount);
        $this->assertSame(185000.0, (float) $transaction->total);
        $this->assertSame(1, (int) $coupon->fresh()->used_count);
    }
}

<?php

namespace Tests\Feature\Client;

use App\Models\Item;
use App\Models\Transaction;
use App\Models\User;
use App\Services\RajaOngkirService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * PPL-09 — Ongkos kirim wajib tersimpan di transaksi dan masuk ke total.
 */
class CheckoutShippingTest extends TestCase
{
    use RefreshDatabase;

    public function test_add_to_cart_rejects_quantity_above_stock(): void
    {
        $user = User::factory()->client()->create();
        $item = $this->makeItem(stock: 2);

        $this->actingAs($user)
            ->post(route('client.cart.add'), [
                'item_id' => $item->id,
                'quantity' => 3,
            ])
            ->assertSessionHas('error');

        $this->assertSame([], session('cart', []));
    }

    public function test_add_to_cart_rejects_unavailable_product(): void
    {
        $user = User::factory()->client()->create();
        $item = $this->makeItem(stock: 5);
        $item->update(['is_available' => false]);

        $this->actingAs($user)
            ->post(route('client.cart.add'), [
                'item_id' => $item->id,
                'quantity' => 1,
            ])
            ->assertSessionHas('error');
    }

    private function makeItem(int $price = 10000, int $stock = 10): Item
    {
        return Item::factory()->create([
            'price' => $price,
            'stock' => $stock,
            'discount' => 0,
            'is_available' => true,
        ]);
    }

    public function test_pickup_checkout_stores_zero_shipping(): void
    {
        $user = User::factory()->create(['role' => 'CLIENT']);
        $item = $this->makeItem(price: 10000, stock: 10);

        $response = $this->actingAs($user)
            ->withSession(['cart' => [$item->id => 2]])
            ->post(route('client.cart.checkout'), [
                'payment_method' => 'bank',
                'delivery_method' => 'pickup',
            ]);

        $response->assertRedirect();

        $transaction = Transaction::firstOrFail();

        $this->assertSame('pickup', $transaction->delivery_method);
        $this->assertSame(0, (int) $transaction->shipping_cost);
        $this->assertSame(20000.0, (float) $transaction->total);
        $this->assertSame(8, (int) $item->fresh()->stock);
    }

    public function test_delivery_checkout_persists_shipping_cost_and_address(): void
    {
        $user = User::factory()->create(['role' => 'CLIENT']);
        $item = $this->makeItem(price: 25000, stock: 5);

        $this->mock(RajaOngkirService::class, function ($mock) {
            $mock->shouldReceive('weightOf')->once()->andReturn(1000);
            $mock->shouldReceive('findOption')->once()->andReturn([
                'courier' => 'jne',
                'service' => 'REG',
                'etd' => '2-3 hari',
                'cost' => 15000,
            ]);
        });

        $response = $this->actingAs($user)
            ->withSession(['cart' => [$item->id => 2]])
            ->post(route('client.cart.checkout'), [
                'payment_method' => 'bank',
                'delivery_method' => 'delivery',
                'recipient_name' => 'Budi Santoso',
                'recipient_phone' => '081234567890',
                'street' => 'Jl. Merdeka No. 10',
                'destination_id' => 501,
                'destination_label' => 'KOTA BANDUNG, JAWA BARAT',
                'courier' => 'jne',
                'service' => 'REG',
            ]);

        $response->assertRedirect();

        $transaction = Transaction::firstOrFail();

        $this->assertSame('delivery', $transaction->delivery_method);
        $this->assertSame(15000, (int) $transaction->shipping_cost);
        $this->assertSame('Budi Santoso', $transaction->recipient_name);
        $this->assertSame('081234567890', $transaction->recipient_phone);
        $this->assertSame('JNE', $transaction->shipping_courier);
        $this->assertSame('REG', $transaction->shipping_service);
        $this->assertSame('2-3 hari', $transaction->shipping_etd);
        $this->assertSame(501, (int) $transaction->shipping_destination_id);
        $this->assertStringContainsString('Jl. Merdeka No. 10', (string) $transaction->shipping_address);

        // Total = (25.000 * 2) + 15.000 ongkir.
        $this->assertSame(65000.0, (float) $transaction->total);
    }

    public function test_delivery_checkout_rejected_when_courier_returns_no_option(): void
    {
        $user = User::factory()->create(['role' => 'CLIENT']);
        $item = $this->makeItem();

        $this->mock(RajaOngkirService::class, function ($mock) {
            $mock->shouldReceive('weightOf')->andReturn(1000);
            $mock->shouldReceive('findOption')->andReturn(null);
        });

        $response = $this->actingAs($user)
            ->withSession(['cart' => [$item->id => 1]])
            ->post(route('client.cart.checkout'), [
                'payment_method' => 'bank',
                'delivery_method' => 'delivery',
                'recipient_name' => 'Budi',
                'recipient_phone' => '081234567890',
                'street' => 'Jl. Mawar 1',
                'destination_id' => 501,
                'destination_label' => 'KOTA BANDUNG',
                'courier' => 'jne',
                'service' => 'REG',
            ]);

        $response->assertSessionHasErrors('checkout');
        $this->assertDatabaseCount('transactions', 0);
        $this->assertSame(10, (int) $item->fresh()->stock);
    }

    public function test_item_has_weight_column_for_rajaongkir(): void
    {
        $item = $this->makeItem();

        $this->assertSame(500, (int) $item->fresh()->weight);
    }
}

<?php

namespace Tests\Feature\Client;

use App\Models\StoreLocation;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/**
 * Letak toko + lacak posisi paket.
 */
class OrderTrackingTest extends TestCase
{
    use RefreshDatabase;

    private function store(): StoreLocation
    {
        return StoreLocation::create([
            'name' => 'Seloyang Rasa - Telang',
            'address' => 'Jl. Telang Indah Barat No. 12',
            'city' => 'Bangkalan',
            'province' => 'Jawa Timur',
            'latitude' => -7.0459,
            'longitude' => 112.7391,
            'opens_at' => '08:00',
            'closes_at' => '21:00',
            'is_active' => true,
        ]);
    }

    private function order(User $client, array $attributes = []): Transaction
    {
        return Transaction::factory()->create(array_merge([
            'client_id' => $client->id,
            'status' => 'paid',
            'payment_method' => 'e-wallet',
            'delivery_method' => 'delivery',
            'shipping_status' => 'shipped',
            'shipping_courier' => 'jne',
            'shipping_service' => 'REG',
            'shipping_cost' => 12000,
            'shipping_address' => 'Jl. Merdeka 1, Surabaya',
            'tracking_number' => 'JNE123',
            'total' => 62000,
        ], $attributes));
    }

    public function test_pembeli_melihat_halaman_lacak_paket(): void
    {
        $this->store();
        $client = User::factory()->client()->create();
        $transaction = $this->order($client, [
            'current_location_note' => 'Transit Surabaya',
            'current_latitude' => -7.2575,
            'current_longitude' => 112.7521,
            'location_updated_at' => now(),
        ]);

        $this->actingAs($client)
            ->get(route('client.orders.tracking', $transaction))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('clients/OrderTracking')
                ->where('transaction.tracking_number', 'JNE123')
                ->where('courierPosition.note', 'Transit Surabaya')
                ->where('store.city', 'Bangkalan')
                ->has('timeline', 6));
    }

    public function test_pesanan_orang_lain_tidak_bisa_dilacak(): void
    {
        $client = User::factory()->client()->create();
        $transaction = $this->order($client);
        $other = User::factory()->client()->create();

        $this->actingAs($other)
            ->get(route('client.orders.tracking', $transaction))
            ->assertForbidden();
    }

    public function test_admin_menyimpan_posisi_paket(): void
    {
        $admin = User::factory()->admin()->create();
        $client = User::factory()->client()->create();
        $transaction = $this->order($client);

        $this->actingAs($admin)
            ->patch(route('transactions.shipping', $transaction), [
                'shipping_status' => 'shipped',
                'tracking_number' => 'JNE999',
                'current_location_note' => 'Gudang Sidoarjo',
                'current_latitude' => -7.4478,
                'current_longitude' => 112.7183,
            ])
            ->assertRedirect();

        $transaction->refresh();

        $this->assertSame('Gudang Sidoarjo', $transaction->current_location_note);
        $this->assertSame(-7.4478, $transaction->current_latitude);
        $this->assertNotNull($transaction->location_updated_at);
    }

    public function test_lokasi_kurir_ditolak_di_luar_rentang(): void
    {
        $admin = User::factory()->admin()->create();
        $client = User::factory()->client()->create();
        $transaction = $this->order($client);

        $this->actingAs($admin)
            ->patch(route('transactions.shipping', $transaction), [
                'shipping_status' => 'shipped',
                'tracking_number' => 'JNE999',
                'current_latitude' => 120,
                'current_longitude' => 200,
            ])
            ->assertSessionHasErrors(['current_latitude', 'current_longitude']);
    }
}

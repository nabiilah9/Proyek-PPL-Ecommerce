<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/**
 * B-3: empat route Inertia yang sebelumnya menunjuk komponen tidak ada.
 */
class PublicPagesTest extends TestCase
{
    use RefreshDatabase;

    public function test_halaman_promo_tampil(): void
    {
        $this->get('/offers')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('offers'));
    }

    public function test_halaman_cara_pesan_tampil(): void
    {
        $this->get('/order')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('order'));
    }

    public function test_halaman_pengiriman_tampil(): void
    {
        $this->get('/Delivery')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Delivery'));
    }

    public function test_halaman_beranda_pembeli_tampil(): void
    {
        $client = User::factory()->client()->create();

        $this->actingAs($client)
            ->get('/user')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('clients/welcome'));
    }
}

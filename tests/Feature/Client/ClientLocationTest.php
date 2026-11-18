<?php

namespace Tests\Feature\Client;

use App\Models\User;
use App\Services\RajaOngkirService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Header "Change Location": simpan lokasi pengiriman di session.
 */
class ClientLocationTest extends TestCase
{
    use RefreshDatabase;

    public function test_pembeli_bisa_mengubah_lokasi(): void
    {
        $client = User::factory()->client()->create();

        $this->actingAs($client)
            ->from('/menu')
            ->post(route('client.location.update'), [
                'destination_id' => 50123,
                'label' => 'Gubeng, Surabaya, Jawa Timur',
                'city' => 'Surabaya',
            ])
            ->assertRedirect('/menu')
            ->assertSessionHas('client_location', [
                'destination_id' => 50123,
                'label' => 'Gubeng, Surabaya, Jawa Timur',
                'city' => 'Surabaya',
            ]);
    }

    public function test_lokasi_kembali_ke_toko(): void
    {
        $client = User::factory()->client()->create();

        $this->actingAs($client)
            ->withSession(['client_location' => ['destination_id' => 1, 'label' => 'X', 'city' => null]])
            ->delete(route('client.location.reset'))
            ->assertSessionMissing('client_location');
    }

    public function test_destination_id_wajib(): void
    {
        $client = User::factory()->client()->create();

        $this->actingAs($client)
            ->post(route('client.location.update'), ['label' => 'Tanpa id'])
            ->assertSessionHasErrors('destination_id');
    }

    public function test_pencarian_lokasi_memakai_rajaongkir(): void
    {
        $client = User::factory()->client()->create();

        $this->mock(RajaOngkirService::class, function ($mock) {
            $mock->shouldReceive('searchDestination')
                ->once()
                ->with('bangkalan')
                ->andReturn([
                    ['id' => 50123, 'label' => 'Bangkalan, Jawa Timur'],
                ]);
        });

        $this->actingAs($client)
            ->getJson(route('client.location.search', ['q' => 'bangkalan']))
            ->assertOk()
            ->assertJsonPath('data.0.id', 50123);
    }

    public function test_kata_kunci_pendek_tidak_memanggil_rajaongkir(): void
    {
        $client = User::factory()->client()->create();

        $this->mock(RajaOngkirService::class, function ($mock) {
            $mock->shouldNotReceive('searchDestination');
        });

        $this->actingAs($client)
            ->getJson(route('client.location.search', ['q' => 'ba']))
            ->assertOk()
            ->assertJsonPath('data', []);
    }
}

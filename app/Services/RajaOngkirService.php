<?php

namespace App\Services;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use App\Models\Item;

class RajaOngkirService
{
    private function client(): PendingRequest
    {
        return Http::baseUrl(config('services.rajaongkir.base_url'))
            ->withHeaders(['key' => config('services.rajaongkir.key')])
            ->acceptJson()
            ->timeout(10);
    }

    // Error yang harus terlihat: key salah, kuota habis, server down
    private function guard(Response $res): void
    {
        if ($res->serverError() || in_array($res->status(), [401, 403, 429])) {
            $res->throw();
        }
    }

    /** Cari lokasi (kelurahan / kecamatan / kota / kode pos). */
    public function searchDestination(string $keyword): array
    {
        $key = 'ro:dest:' . md5(mb_strtolower($keyword));

        if ($cached = Cache::get($key)) {
            return $cached;
        }

        $res = $this->client()->get('destination/domestic-destination', [
            'search' => $keyword,
            'limit' => 10,
            'offset' => 0,
        ]);
        $this->guard($res);

        $data = $res->json('data') ?? [];
        if ($data) {
            Cache::put($key, $data, now()->addDay());
        }

        return $data;
    }

    /** Hitung ongkir dari toko ke tujuan. Berat dalam gram. */
    public function calculate(int $destinationId, int $weightGram): array
    {
        $origin = (int) config('services.rajaongkir.origin');
        $couriers = config('services.rajaongkir.couriers');
        $weight = max($weightGram, 1);
        $key = "ro:cost:{$origin}:{$destinationId}:{$weight}:{$couriers}";

        if ($cached = Cache::get($key)) {
            return $cached;
        }

        $res = $this->client()->asForm()->post('calculate/domestic-cost', [
            'origin' => $origin,
            'destination' => $destinationId,
            'weight' => $weight,
            'courier' => $couriers,
        ]);
        $this->guard($res);

        $options = collect($res->json('data') ?? [])->map(fn($r) => [
            'courier' => $r['code'],
            'name' => $r['name'],
            'service' => $r['service'],
            'description' => $r['description'] ?? '',
            'cost' => (int) $r['cost'],
            'etd' => $r['etd'] ?? '-',
        ])->values()->all();

        if ($options) {
            Cache::put($key, $options, now()->addHour());
        }

        return $options;
    }

    /** Cari satu layanan tertentu (dipakai saat checkout untuk validasi di server). */
    public function findOption(int $destinationId, int $weightGram, string $courier, string $service): ?array
    {
        foreach ($this->calculate($destinationId, $weightGram) as $option) {
            if ($option['courier'] === $courier && $option['service'] === $service) {
                return $option;
            }
        }

        return null;
    }

    /** Total berat keranjang dalam gram, dihitung dari DB (bukan dari browser). */
    public function weightOf(array $cart): int
    {
        return (int) Item::whereIn('id', array_keys($cart))->get()
            ->sum(fn($item) => $item->weight * ($cart[$item->id] ?? 0));
    }
}
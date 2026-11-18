<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\StoreLocation;
use App\Services\RajaOngkirService;
use Illuminate\Http\Request;
use Throwable;

class LocationController extends Controller {
    /**
     * Simpan lokasi pengiriman pilihan pembeli (dipakai header + keranjang).
     */
    public function update(Request $request) {
        $validated = $request->validate([
            'destination_id' => ['required', 'integer', 'min:1'],
            'label' => ['required', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:120'],
        ]);

        $request->session()->put('client_location', [
            'destination_id' => (int) $validated['destination_id'],
            'label' => $validated['label'],
            'city' => $validated['city'] ?? null,
        ]);

        return back()->with('success', 'Lokasi pengiriman diubah ke ' . $validated['label'] . '.');
    }

    /**
     * Reset ke lokasi toko.
     */
    public function reset(Request $request) {
        $request->session()->forget('client_location');

        return back()->with('success', 'Lokasi pengiriman dikembalikan ke lokasi toko.');
    }

    /**
     * Proxy pencarian tujuan RajaOngkir untuk modal header.
     */
    public function search(Request $request, RajaOngkirService $ro) {
        $keyword = trim((string) $request->query('q'));

        if (mb_strlen($keyword) < 3) {
            return response()->json(['data' => []]);
        }

        try {
            return response()->json(['data' => $ro->searchDestination($keyword)]);
        } catch (Throwable $exception) {
            report($exception);

            return response()->json(['message' => 'Layanan ongkir sedang bermasalah.'], 502);
        }
    }

    /**
     * Lokasi toko untuk halaman info pengiriman.
     */
    public function store() {
        $store = StoreLocation::primary();

        return response()->json([
            'store' => $store?->toClientArray(),
        ]);
    }
}

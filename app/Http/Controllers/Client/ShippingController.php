<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Services\RajaOngkirService;
use Illuminate\Http\Request;
use Throwable;

class ShippingController extends Controller
{
    public function destinations(Request $request, RajaOngkirService $ro)
    {
        $keyword = trim((string) $request->query('search'));

        if (mb_strlen($keyword) < 3) {
            return response()->json([]);
        }

        try {
            return response()->json($ro->searchDestination($keyword));
        } catch (Throwable $e) {
            report($e);
            return response()->json(['message' => 'Layanan ongkir sedang bermasalah.'], 502);
        }
    }

    public function cost(Request $request, RajaOngkirService $ro)
    {
        $data = $request->validate(['destination_id' => 'required|integer|min:1']);

        $cart = session('cart', []);
        if (empty($cart)) {
            return response()->json(['message' => 'Keranjang kosong.'], 422);
        }

        try {
            $options = $ro->calculate((int) $data['destination_id'], $ro->weightOf($cart));
        } catch (Throwable $e) {
            report($e);
            return response()->json(['message' => 'Ongkos kirim tidak dapat dihitung saat ini.'], 502);
        }

        if (empty($options)) {
            return response()->json(['message' => 'Tidak ada layanan pengiriman ke tujuan ini.'], 404);
        }

        return response()->json(['options' => $options]);
    }
}
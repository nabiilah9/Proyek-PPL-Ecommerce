<?php

namespace Database\Seeders;

use App\Models\Coupon;
use Illuminate\Database\Seeder;

/**
 * Contoh kode diskon untuk demo (PPL-10).
 */
class CouponSeeder extends Seeder
{
    public function run(): void
    {
        $coupons = [
            [
                'code' => 'HEMAT10',
                'description' => 'Potongan 10% maksimal Rp 15.000, minimal belanja Rp 50.000',
                'type' => 'percent',
                'value' => 10,
                'min_spend' => 50000,
                'max_discount' => 15000,
                'starts_at' => now()->subDay(),
                'ends_at' => now()->addMonths(3),
                'usage_limit' => 100,
            ],
            [
                'code' => 'KUEBARU',
                'description' => 'Potongan Rp 20.000 tanpa minimum belanja',
                'type' => 'fixed',
                'value' => 20000,
                'min_spend' => 0,
                'max_discount' => null,
                'starts_at' => now()->subDay(),
                'ends_at' => now()->addMonths(1),
                'usage_limit' => 50,
            ],
            [
                'code' => 'LEBARAN25',
                'description' => 'Potongan 25% maksimal Rp 50.000, minimal belanja Rp 150.000',
                'type' => 'percent',
                'value' => 25,
                'min_spend' => 150000,
                'max_discount' => 50000,
                'starts_at' => now()->subDay(),
                'ends_at' => now()->addMonths(2),
                'usage_limit' => null,
            ],
        ];

        foreach ($coupons as $coupon) {
            Coupon::updateOrCreate(['code' => $coupon['code']], $coupon + ['is_active' => true]);
        }
    }
}

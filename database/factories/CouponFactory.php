<?php

namespace Database\Factories;

use App\Models\Coupon;
use Illuminate\Database\Eloquent\Factories\Factory;

class CouponFactory extends Factory
{
    protected $model = Coupon::class;

    public function definition(): array
    {
        return [
            'code' => strtoupper($this->faker->unique()->bothify('PROMO###')),
            'description' => $this->faker->sentence(),
            'type' => 'percent',
            'value' => 10,
            'min_spend' => 0,
            'max_discount' => null,
            'starts_at' => now()->subDay(),
            'ends_at' => now()->addMonth(),
            'usage_limit' => null,
            'used_count' => 0,
            'is_active' => true,
        ];
    }
}

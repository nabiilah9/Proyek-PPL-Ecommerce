<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class TransactionFactory extends Factory {
    public function definition(): array {
        return [
            'client_id' => User::factory(),
            'total' => $this->faker->numberBetween(1000, 10000),
            'note' => $this->faker->sentence(),
            'payment_method' => $this->faker->randomElement([
                'cash',
                'bank',
                'e-wallet'
            ]),
            'status' => $this->faker->randomElement([
                'pending',
                'paid',
                'canceled',
                'failed'
            ]),
        ];
    }
}

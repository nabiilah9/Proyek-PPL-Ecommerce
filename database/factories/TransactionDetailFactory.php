<?php

namespace Database\Factories;

use App\Models\Item;
use App\Models\Transaction;
use Illuminate\Database\Eloquent\Factories\Factory;

class TransactionDetailFactory extends Factory {
    public function definition(): array {
        $item = Item::inRandomOrder()->first();
        return [
            'transaction_id' => Transaction::factory(),
            'item_id' => Item::factory(),
            'quantity' => $this->faker->numberBetween(1, 10),
            'price_at_time' => $item->price,
        ];
    }
}
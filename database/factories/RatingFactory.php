<?php

namespace Database\Factories;

use App\Models\Item;
use Illuminate\Database\Eloquent\Factories\Factory;

class RatingFactory extends Factory {
    public function definition(): array {
        return [
            'item_id' => Item::factory(),
            'score' => $this->faker->numberBetween(1, 5),
            'comment' => $this->faker->sentence(),
        ];
    }
}
<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class FeedbackFactory extends Factory {
    public function definition(): array {
        return [
            'client_id' => User::factory(),
            'message' => $this->faker->sentence(),
            'type' => $this->faker->randomElements([
                'COMPLAINT', 'SUGGESTION', 'PRAISE', 'BUG'
            ]),
        ];
    }
}
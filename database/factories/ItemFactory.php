<?php

namespace Database\Factories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;

class ItemFactory extends Factory {
    public function definition(): array {
        return [
            'category_id' => Category::factory(),
            'name' => $this->faker->name(),
            'unit' => $this->faker->randomElement(['pcs', 'pack', 'kg']),
            'price' => $this->faker->numberBetween(1000, 10000),
            'stock' => $this->faker->numberBetween(10, 100),
            'image_url' => $this->faker->imageUrl(200, 200, 'people'),
            'is_available' => $this->faker->boolean(),
            'description' => $this->faker->paragraph(),
            'discount' => $this->faker->numberBetween(1, 100),
            'expired_at'   => $this->faker->dateTimeBetween('+7 days', '+1 year'),
        ];
    }
}
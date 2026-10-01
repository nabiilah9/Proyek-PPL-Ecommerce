<?php

namespace Database\Factories;

use App\Models\Contact;
use Illuminate\Database\Eloquent\Factories\Factory;

class AddressFactory extends Factory {
    public function definition(): array {
        return [
            'post_code' => $this->faker->postcode(),
            'country' => $this->faker->country(),
            'province' => $this->faker->state(),
            'city' => $this->faker->city(),
            'street' => $this->faker->streetAddress(),
            'more' => $this->faker->shuffleString(),
        ];
    }
}
<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ContactFactory extends Factory {
    public function definition(): array {
        return [
            'name' => $this->faker->name(),
            'phone' => $this->faker->phoneNumber(),
            'profile' => $this->faker->imageUrl(200, 200, 'people'),
            'gender' => $this->faker->randomElement(['MAN', 'WOMAN']),
            'birthday' => $this->faker->date('Y-m-d', '-18 years'),
            'favourite' => json_encode($this->faker->randomElements([
                'Gorengan', 'Kue Kering', 'Kue Basah'
            ], rand(1, 3))),
        ];
    }
}
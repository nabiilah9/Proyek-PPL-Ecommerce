<?php

namespace Database\Seeders;

use App\Models\StoreLocation;
use Illuminate\Database\Seeder;

class StoreLocationSeeder extends Seeder {
    public function run(): void {
        StoreLocation::updateOrCreate(
            ['name' => 'Seloyang Rasa - Telang'],
            [
                'address' => 'Jl. Telang Indah Barat No. 12, Telang',
                'city' => 'Bangkalan',
                'province' => 'Jawa Timur',
                'postal_code' => '69112',
                'phone' => '081234567890',
                'latitude' => -7.0459000,
                'longitude' => 112.7391000,
                'opens_at' => '08:00',
                'closes_at' => '21:00',
                'is_active' => true,
            ]
        );
    }
}

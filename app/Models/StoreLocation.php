<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StoreLocation extends Model {
    protected $fillable = [
        'name',
        'address',
        'city',
        'province',
        'postal_code',
        'phone',
        'latitude',
        'longitude',
        'opens_at',
        'closes_at',
        'is_active',
    ];

    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
        'is_active' => 'boolean',
    ];

    /**
     * Toko utama yang dipakai sebagai titik asal pengiriman.
     */
    public static function primary(): ?self {
        return static::where('is_active', true)->orderBy('id')->first()
            ?? static::orderBy('id')->first();
    }

    public function coordinates(): ?array {
        if ($this->latitude === null || $this->longitude === null) {
            return null;
        }

        return ['lat' => (float) $this->latitude, 'lng' => (float) $this->longitude];
    }

    public function toClientArray(): array {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'address' => $this->address,
            'city' => $this->city,
            'province' => $this->province,
            'phone' => $this->phone,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'opens_at' => $this->opens_at,
            'closes_at' => $this->closes_at,
        ];
    }
}

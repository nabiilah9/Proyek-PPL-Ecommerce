<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany; // Import HasMany

class Contact extends Model {
    use HasFactory;

    // protected $with = ['user', 'addresses']; // Eager load plural addresses

    public function user(): BelongsTo {
        return $this->belongsTo(User::class, "user_id", "id");
    }

    public function addresses(): HasMany { // Changed back to HasMany for multiple addresses
        return $this->hasMany(Address::class, "contact_id", "id");
    }

    protected $fillable = [
        'user_id',
        'name', 'gender', 'phone',
        'profile', 'birthday', 'favourite',
    ];
}
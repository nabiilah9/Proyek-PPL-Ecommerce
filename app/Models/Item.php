<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Item extends Model {
    use HasFactory;

    // protected $with = ['category', 'transactions', 'ratings'];

    public function category(): BelongsTo { // M:1
        return $this->belongsTo(Category::class, 'category_id', 'id');
    }

    public function transactions(): BelongsToMany { // M:N
        return $this->belongsToMany(Transaction::class, 'transaction_details')
                    ->withPivot('qty', 'price_at_time')
                    ->withTimestamps();
    }

    public function ratings(): HasMany { // 1:M
        return $this->hasMany(Rating::class, 'rating_id', 'id');
    }

    protected $fillable= [
        'category_id',
        'name', 'unit', 'price', 'stock',
        'image_url', 'is_avaible', 'description', 'discount',
        'expired_at'
    ];
}
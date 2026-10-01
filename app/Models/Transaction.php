<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Transaction extends Model {
    use HasFactory;

    // protected $with = ['user', 'items'];

    public function user(): BelongsTo { // M:1
        return $this->belongsTo(User::class, 'client_id', 'id');
    }

    public function items(): BelongsToMany { // M:N
        return $this->belongsToMany(Item::class, 'transaction_details')
                    ->withPivot('qty', 'price_at_time')
                    ->withTimestamps();
    }

    protected $fillable = [
        'client_id',
        'total', 'note', 'payment_method', 'status'
    ];
}
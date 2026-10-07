<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TransactionDetail extends Model
{
    use HasFactory;

    protected $fillable = [
        'transaction_id',
        'item_id',
        'quantity',
        'price_at_time',
    ];

    /**
     * Transaksi
     */
    public function transaction(): BelongsTo
    {
        return $this->belongsTo(
            Transaction::class,
            'transaction_id',
            'id'
        );
    }

    /**
     * Produk
     */
    public function item(): BelongsTo
    {
        return $this->belongsTo(
            Item::class,
            'item_id',
            'id'
        );
    }
}
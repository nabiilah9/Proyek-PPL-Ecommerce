<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Transaction extends Model {
    use HasFactory;


    protected $fillable = [
        'client_id',
        'total',
        'note',
        'payment_method',
        'status',
        'midtrans_order_id',
        'snap_token',
        'payment_type',
        'paid_at',
        'received_at',
        'delivery_method',
        'recipient_name',
        'recipient_phone',
        'shipping_address',
        'shipping_destination_id',
        'shipping_courier',
        'shipping_service',
        'shipping_etd',
        'shipping_cost',
        'shipping_status',
        'tracking_number',
        'current_location_note',
        'current_latitude',
        'current_longitude',
        'location_updated_at',
        'packed_at',
        'shipped_at',
        'delivered_at',
        'verified_by',
        'verified_at',
        'coupon_id',
        'coupon_code',
        'coupon_discount',
    ];

    protected $casts = [
        'paid_at' => 'datetime',
        'received_at' => 'datetime',
        'packed_at' => 'datetime',
        'shipped_at' => 'datetime',
        'delivered_at' => 'datetime',
        'verified_at' => 'datetime',
        'location_updated_at' => 'datetime',
        'current_latitude' => 'float',
        'current_longitude' => 'float',
    ];

    /**
     * User / Client yang melakukan transaksi
     */
    public function user(): BelongsTo {
        return $this->belongsTo(
            User::class,
            'client_id',
            'id'
        );
    }

    /**
     * Detail transaksi
     *
     * transactions
     *      ↓
     * transaction_details
     */
    public function details(): HasMany {
        return $this->hasMany(
            TransactionDetail::class,
            'transaction_id',
            'id'
        );
    }

    /**
     * Produk yang ada di transaksi
     *
     * Relasi ini tetap dipertahankan
     * untuk kebutuhan lain.
     */
    public function items(): BelongsToMany {
        return $this->belongsToMany(
            Item::class,
            'transaction_details',
            'transaction_id',
            'item_id'
        )
            ->withPivot(
                'quantity',
                'price_at_time'
            )
            ->withTimestamps();
    }

    public function ratings(): HasMany
    {
        return $this->hasMany(Rating::class, 'transaction_id', 'id');
    }
}

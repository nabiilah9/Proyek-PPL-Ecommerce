<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Rating extends Model {
    use HasFactory;

    // protected $with = ['item'];

    public function item(): BelongsTo { // M:1
        return $this->belongsTo(Item::class, 'item_id', 'id');
    }

    protected $fillable = [
        'item_id',
        'score', 'comment'
    ];
}
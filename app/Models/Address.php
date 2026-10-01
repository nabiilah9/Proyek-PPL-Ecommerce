<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Address extends Model {
    use HasFactory;

    // protected $with = ['contact']; // Uncomment if you want to eager load contact when fetching an address

    // Define the BelongsTo relationship explicitly
    // 'contact_id' is the foreign key on the addresses table
    // 'id' is the local key on the contacts table
    public function contact(): BelongsTo { // M:1
        return $this->belongsTo(Contact::class, 'contact_id', 'id');
    }

    protected $fillable = [
        'contact_id', // This is crucial for mass assignment when creating/updating addresses
        'post_code',
        'country',
        'province',
        'city',
        'street',
        'more'
    ];
}
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne; // Import HasOne
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;
    use SoftDeletes;

    protected $table = 'users';
    protected $primaryKey = 'id';

    public function transactions(): HasMany {
        return $this->hasMany(Transaction::class, 'client_id', 'id');
    }

    public function contact(): HasOne 
    {
        return $this->hasOne(Contact::class, 'user_id', 'id');
    }

    protected $fillable = [
        'name',
        'username',
        'email',
        'password',
        'role',
        'status',
        'avatar',
        'email_verified_at',
        'google_id',
        'google_token',
        'google_refresh_token',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'google_token',
        'google_refresh_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}
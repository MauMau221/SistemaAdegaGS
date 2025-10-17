<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Address extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'street',
        'number',
        'complement',
        'neighborhood',
        'city',
        'state',
        'zipcode',
        'notes',
        'is_default',
        'is_active'
    ];

    protected $casts = [
        'is_default' => 'boolean',
        'is_active' => 'boolean'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class, 'delivery_address_id');
    }

    public function getFullAddressAttribute(): string
    {
        $address = "{$this->street}, {$this->number}";
        
        if ($this->complement) {
            $address .= ", {$this->complement}";
        }
        
        $address .= " - {$this->neighborhood}, {$this->city}/{$this->state}";
        
        if ($this->zipcode) {
            $address .= " - CEP: {$this->zipcode}";
        }
        
        return $address;
    }

    public function getShortAddressAttribute(): string
    {
        return "{$this->neighborhood}, {$this->city}";
    }
}

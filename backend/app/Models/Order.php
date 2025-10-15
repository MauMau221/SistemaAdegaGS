<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    protected $fillable = [
        'user_id',
        'order_number',
        'status',
        'total',
    ];

    protected $casts = [
        'total' => 'decimal:2',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function payment(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($order) {
            if (empty($order->order_number)) {
                $lastOrder = static::orderBy('id', 'desc')->first();
                $nextId = $lastOrder ? $lastOrder->id + 1 : 1;
                $order->order_number = date('Ymd') . str_pad($nextId, 4, '0', STR_PAD_LEFT);
            }
        });
    }
}
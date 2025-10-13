<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'order_number',
        'type',
        'status',
        'total_amount',
        'delivery_address',
        'payment_method',
        'payment_status',
        'payment_details',
        'discount_code',
        'notes'
    ];

    protected $casts = [
        'delivery_address' => 'array',
        'payment_details' => 'array',
        'total_amount' => 'decimal:2'
    ];

    // Accessor para manter compatibilidade com 'total'
    public function getTotalAttribute()
    {
        return $this->total_amount;
    }

    // Mutator para manter compatibilidade com 'total'
    public function setTotalAttribute($value)
    {
        $this->attributes['total_amount'] = $value;
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function calculateTotal()
    {
        // Recarregar os itens do banco para garantir dados atualizados
        $this->load('items');
        
        $total = $this->items->sum(function ($item) {
            return $item->quantity * $item->unit_price;
        });
        
        $this->total_amount = $total;
        $this->save();
        
        return $total;
    }
}
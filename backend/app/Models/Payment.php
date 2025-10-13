<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Payment extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'order_id',
        'transaction_id',
        'payment_method',
        'status',
        'amount',
        'payment_details'
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'payment_details' => 'array'
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function markAsApproved()
    {
        $this->status = 'approved';
        $this->save();
        
        // Atualiza o status do pedido
        $this->order->status = 'paid';
        $this->order->save();
    }

    public function createFinancialTransaction()
    {
        return FinancialTransaction::create([
            'order_id' => $this->order_id,
            'type' => 'income',
            'category' => 'sale',
            'amount' => $this->amount,
            'description' => "Pagamento do pedido #{$this->order->order_number}",
            'transaction_date' => now(),
            'created_by' => $this->order->user_id
        ]);
    }
}

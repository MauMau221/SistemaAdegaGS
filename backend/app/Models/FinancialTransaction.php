<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class FinancialTransaction extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'order_id',
        'type',
        'category',
        'amount',
        'description',
        'transaction_date',
        'created_by'
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'transaction_date' => 'date'
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public static function getDailyBalance($date)
    {
        return self::whereDate('transaction_date', $date)
            ->selectRaw('
                SUM(CASE WHEN type = "income" THEN amount ELSE 0 END) as total_income,
                SUM(CASE WHEN type = "expense" THEN amount ELSE 0 END) as total_expense,
                SUM(CASE WHEN type = "income" THEN amount ELSE -amount END) as balance
            ')
            ->first();
    }
}

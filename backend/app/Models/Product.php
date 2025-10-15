<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'name',
        'slug',
        'description',
        'price',
        'cost_price',
        'stock_quantity',
        'min_stock_quantity',
        'sku',
        'barcode',
        'is_active',
        'featured',
        'images'
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'cost_price' => 'decimal:2',
        'stock_quantity' => 'integer',
        'min_stock_quantity' => 'integer',
        'is_active' => 'boolean',
        'featured' => 'boolean',
        'images' => 'array'
    ];

    protected $appends = ['low_stock'];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function stockMovements(): HasMany
    {
        return $this->hasMany(StockMovement::class);
    }

    public function getLowStockAttribute(): bool
    {
        return $this->stock_quantity <= $this->min_stock_quantity;
    }

    public function updateStock(int $quantity, string $type, ?string $description = null, ?float $unitCost = null): void
    {
        $movement = new StockMovement([
            'user_id' => auth()->id(),
            'type' => $type,
            'quantity' => $quantity,
            'description' => $description,
            'unit_cost' => $unitCost
        ]);

        $this->stockMovements()->save($movement);

        if ($type === 'entrada') {
            $this->stock_quantity += $quantity;
        } elseif ($type === 'saida') {
            $this->stock_quantity -= $quantity;
        } else { // ajuste
            $this->stock_quantity = $quantity;
        }

        $this->save();
    }
}
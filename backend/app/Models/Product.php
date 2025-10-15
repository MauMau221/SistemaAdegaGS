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
        'current_stock',
        'min_stock',
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
        'current_stock' => 'integer',
        'min_stock' => 'integer',
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
        $currentStock = $this->current_stock ?? $this->stock_quantity;
        $minStock = $this->min_stock ?? $this->min_stock_quantity;
        return $currentStock <= $minStock;
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

        // Usar current_stock se disponível, senão usar stock_quantity
        $stockField = $this->getConnection()->getSchemaBuilder()->hasColumn($this->getTable(), 'current_stock') ? 'current_stock' : 'stock_quantity';

        if ($type === 'entrada') {
            $this->increment($stockField, $quantity);
        } elseif ($type === 'saida') {
            $this->decrement($stockField, $quantity);
        } else { // ajuste
            $this->update([$stockField => $quantity]);
        }
    }
}
<?php

namespace App\Services;

use App\Models\Product;
use App\Models\StockMovement;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class StockService
{
    public function getProductStock(int $productId): Product
    {
        return Product::with(['stockMovements' => function ($query) {
            $query->latest()->limit(10);
        }])->findOrFail($productId);
    }

    public function getAllStock(array $filters = []): LengthAwarePaginator
    {
        $query = Product::query()
            ->with(['category'])
            ->when(isset($filters['low_stock']), function ($query) {
                $query->whereRaw('current_stock <= min_stock');
            })
            ->when(isset($filters['search']), function ($query) use ($filters) {
                $search = $filters['search'];
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('sku', 'like', "%{$search}%")
                        ->orWhere('barcode', 'like', "%{$search}%");
                });
            });

        return $query->paginate(15);
    }

    public function updateStock(
        int $productId,
        int $quantity,
        string $type,
        ?string $description = null,
        ?float $unitCost = null
    ): Product {
        $product = Product::findOrFail($productId);

        if ($type === 'saida' && $quantity > $product->current_stock) {
            throw new \Exception('Quantidade insuficiente em estoque');
        }

        $product->updateStock($quantity, $type, $description, $unitCost);

        return $product->fresh();
    }

    public function getStockMovements(int $productId): Collection
    {
        return StockMovement::with(['user'])
            ->where('product_id', $productId)
            ->latest()
            ->get();
    }

    public function getLowStockProducts(): Collection
    {
        return Product::whereRaw('current_stock <= min_stock')
            ->with('category')
            ->get();
    }

    public function getStockSummary(): array
    {
        return [
            'total_products' => Product::count(),
            'low_stock_count' => Product::whereRaw('current_stock <= min_stock')->count(),
            'out_of_stock_count' => Product::where('current_stock', 0)->count(),
            'total_stock_value' => Product::sum(\DB::raw('current_stock * cost_price'))
        ];
    }
}

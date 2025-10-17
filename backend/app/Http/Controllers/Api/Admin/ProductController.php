<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Product::with(['category']);

        // Filtros
        if ($request->has('search') && $request->search) {
            $query->where(function($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('sku', 'like', '%' . $request->search . '%')
                  ->orWhere('barcode', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->has('is_active')) {
            $isActive = filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN);
            $query->where('is_active', $isActive);
        }

        if ($request->has('low_stock') && $request->low_stock) {
            $query->whereColumn('current_stock', '<=', 'min_stock');
        }

        // Ordenação
        $sortBy = $request->get('sort_by', 'name');
        $sortOrder = $request->get('sort_order', 'asc');
        $query->orderBy($sortBy, $sortOrder);

        // Paginação
        $perPage = $request->get('per_page', 10);
        $products = $query->paginate($perPage);

        return response()->json([
            'data' => $products->items(),
            'total' => $products->total(),
            'current_page' => $products->currentPage(),
            'per_page' => $products->perPage(),
            'last_page' => $products->lastPage()
        ]);
    }

    public function show(Product $product): JsonResponse
    {
        $product->load(['category', 'stockMovements']);
        return response()->json($product);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'current_stock' => 'required|integer|min:0',
            'min_stock' => 'required|integer|min:0',
            'sku' => 'required|string|unique:products,sku',
            'barcode' => 'nullable|string|unique:products,barcode',
            'category_id' => 'required|exists:categories,id',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'is_active' => 'boolean'
        ]);

        $product = new Product();
        $product->name = $request->name;
        $product->description = $request->description;
        $product->price = $request->price;
        $product->current_stock = $request->current_stock;
        $product->min_stock = $request->min_stock;
        $product->sku = $request->sku;
        $product->barcode = $request->barcode;
        $product->category_id = $request->category_id;
        $product->is_active = $request->boolean('is_active', true);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('products', 'public');
            $product->image_url = Storage::url($path);
        }

        $product->save();

        // Criar movimento de estoque inicial
        $product->stockMovements()->create([
            'user_id' => auth()->id(),
            'type' => 'entrada',
            'quantity' => $request->current_stock,
            'description' => 'Estoque inicial'
        ]);

        return response()->json($product, 201);
    }

    public function update(Request $request, Product $product): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'current_stock' => 'required|integer|min:0',
            'min_stock' => 'required|integer|min:0',
            'sku' => 'required|string|unique:products,sku,' . $product->id,
            'barcode' => 'nullable|string|unique:products,barcode,' . $product->id,
            'category_id' => 'required|exists:categories,id',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'is_active' => 'boolean'
        ]);

        $oldStock = $product->current_stock;
        $newStock = $request->current_stock;

        $product->name = $request->name;
        $product->description = $request->description;
        $product->price = $request->price;
        $product->current_stock = $newStock;
        $product->min_stock = $request->min_stock;
        $product->sku = $request->sku;
        $product->barcode = $request->barcode;
        $product->category_id = $request->category_id;
        $product->is_active = $request->boolean('is_active', true);

        if ($request->hasFile('image')) {
            // Deletar imagem anterior se existir
            if ($product->image_url) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $product->image_url));
            }

            $path = $request->file('image')->store('products', 'public');
            $product->image_url = Storage::url($path);
        }

        $product->save();

        // Criar movimento de estoque se a quantidade mudou
        if ($oldStock != $newStock) {
            $difference = $newStock - $oldStock;
            $type = $difference > 0 ? 'in' : 'out';
            $reason = $difference > 0 ? 'Ajuste de estoque (entrada)' : 'Ajuste de estoque (saída)';

            $product->stockMovements()->create([
                'type' => $type,
                'quantity' => abs($difference),
                'reason' => $reason,
                'user_id' => auth()->id()
            ]);
        }

        return response()->json($product);
    }

    public function destroy(Product $product): JsonResponse
    {
        // Verificar se o produto tem pedidos
        if ($product->orderItems()->count() > 0) {
            return response()->json(['error' => 'Não é possível excluir produto com pedidos'], 400);
        }

        // Deletar imagem se existir
        if ($product->image_url) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $product->image_url));
        }

        // Deletar movimentos de estoque
        $product->stockMovements()->delete();

        $product->delete();

        return response()->json(null, 204);
    }

    public function toggleStatus(Product $product): JsonResponse
    {
        $product->is_active = !$product->is_active;
        $product->save();

        return response()->json($product);
    }

    public function uploadImage(Request $request, Product $product): JsonResponse
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        // Deletar imagem anterior se existir
        if ($product->image_url) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $product->image_url));
        }

        $path = $request->file('image')->store('products', 'public');
        $product->image_url = Storage::url($path);
        $product->save();

        return response()->json($product);
    }

    public function deleteImage(Product $product): JsonResponse
    {
        if ($product->image_url) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $product->image_url));
            $product->image_url = null;
            $product->save();
        }

        return response()->json($product);
    }

    public function generateSku(): JsonResponse
    {
        do {
            $sku = 'PRD' . str_pad(rand(1, 999999), 6, '0', STR_PAD_LEFT);
        } while (Product::where('sku', $sku)->exists());

        return response()->json(['sku' => $sku]);
    }

    public function validateSku(Request $request): JsonResponse
    {
        $request->validate([
            'sku' => 'required|string',
            'exclude_id' => 'nullable|integer'
        ]);

        $query = Product::where('sku', $request->sku);
        
        if ($request->has('exclude_id')) {
            $query->where('id', '!=', $request->exclude_id);
        }

        $exists = $query->exists();

        return response()->json(['valid' => !$exists]);
    }

    public function validateBarcode(Request $request): JsonResponse
    {
        $request->validate([
            'barcode' => 'required|string',
            'exclude_id' => 'nullable|integer'
        ]);

        $query = Product::where('barcode', $request->barcode);
        
        if ($request->has('exclude_id')) {
            $query->where('id', '!=', $request->exclude_id);
        }

        $exists = $query->exists();

        return response()->json(['valid' => !$exists]);
    }

    public function import(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,xlsx,xls'
        ]);

        // Implementar lógica de importação
        // Por enquanto, retornar sucesso
        return response()->json([
            'imported' => 0,
            'errors' => ['Funcionalidade de importação será implementada']
        ]);
    }

    public function export(Request $request): JsonResponse
    {
        $request->validate([
            'format' => 'required|in:csv,xlsx'
        ]);

        // Implementar lógica de exportação
        // Por enquanto, retornar erro
        return response()->json(['error' => 'Funcionalidade de exportação será implementada'], 501);
    }
}

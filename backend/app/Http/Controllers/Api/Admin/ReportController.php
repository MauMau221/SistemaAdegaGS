<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\Category;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

class ReportController extends Controller
{
    public function dashboardSummary(): JsonResponse
    {
        $today = Carbon::today();
        $thisMonth = Carbon::now()->startOfMonth();
        
        // Resumo geral
        $totalProducts = Product::count();
        $totalCategories = Category::count();
        $totalUsers = User::count();
        $totalOrders = Order::count();
        
        // Vendas do mês
        $monthlySales = Order::where('created_at', '>=', $thisMonth)
            ->where('status', 'completed')
            ->sum('total');
        
        // Vendas de hoje
        $dailySales = Order::whereDate('created_at', $today)
            ->where('status', 'completed')
            ->sum('total');
        
        // Pedidos pendentes
        $pendingOrders = Order::where('status', 'pending')->count();
        
        return response()->json([
            'total_products' => $totalProducts,
            'total_categories' => $totalCategories,
            'total_users' => $totalUsers,
            'total_orders' => $totalOrders,
            'monthly_sales' => $monthlySales,
            'daily_sales' => $dailySales,
            'pending_orders' => $pendingOrders
        ]);
    }

    public function salesChart(): JsonResponse
    {
        $last30Days = Carbon::now()->subDays(30);
        
        $salesData = Order::where('created_at', '>=', $last30Days)
            ->where('status', 'completed')
            ->selectRaw('DATE(created_at) as date, SUM(total) as total')
            ->groupBy('date')
            ->orderBy('date')
            ->get();
        
        return response()->json($salesData);
    }

    public function topProducts(): JsonResponse
    {
        $topProducts = Product::with('category')
            ->withSum('orderItems', 'quantity')
            ->orderBy('order_items_sum_quantity', 'desc')
            ->take(5)
            ->get();
        
        return response()->json($topProducts);
    }

    public function topCustomers(): JsonResponse
    {
        $topCustomers = User::withSum('orders', 'total')
            ->where('type', 'customer')
            ->orderBy('orders_sum_total', 'desc')
            ->take(5)
            ->get();
        
        return response()->json($topCustomers);
    }
    public function sales(Request $request): JsonResponse
    {
        $request->validate([
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'period' => 'nullable|in:daily,weekly,monthly,yearly'
        ]);

        $startDate = $request->start_date ? Carbon::parse($request->start_date) : Carbon::now()->startOfMonth();
        $endDate = $request->end_date ? Carbon::parse($request->end_date) : Carbon::now()->endOfMonth();

        $query = Order::whereBetween('created_at', [$startDate, $endDate]);

        // Vendas por período
        $salesData = $query->selectRaw('DATE(created_at) as date, COUNT(*) as orders_count, SUM(total) as total_sales')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Vendas por status
        $salesByStatus = Order::whereBetween('created_at', [$startDate, $endDate])
            ->selectRaw('status, COUNT(*) as count, SUM(total) as total')
            ->groupBy('status')
            ->get();

        // Vendas por método de pagamento
        $salesByPayment = Order::whereBetween('created_at', [$startDate, $endDate])
            ->join('payments', 'orders.id', '=', 'payments.order_id')
            ->selectRaw('payments.payment_method, COUNT(*) as count, SUM(orders.total) as total')
            ->groupBy('payments.payment_method')
            ->get();

        // Resumo geral
        $summary = [
            'total_orders' => Order::whereBetween('created_at', [$startDate, $endDate])->count(),
            'total_sales' => Order::whereBetween('created_at', [$startDate, $endDate])->sum('total'),
            'average_order_value' => Order::whereBetween('created_at', [$startDate, $endDate])->avg('total'),
            'pending_orders' => Order::whereBetween('created_at', [$startDate, $endDate])->where('status', 'pending')->count(),
            'completed_orders' => Order::whereBetween('created_at', [$startDate, $endDate])->where('status', 'completed')->count(),
        ];

        return response()->json([
            'period' => [
                'start_date' => $startDate->toDateString(),
                'end_date' => $endDate->toDateString()
            ],
            'summary' => $summary,
            'sales_data' => $salesData,
            'sales_by_status' => $salesByStatus,
            'sales_by_payment' => $salesByPayment
        ]);
    }

    public function products(Request $request): JsonResponse
    {
        $request->validate([
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'category_id' => 'nullable|exists:categories,id'
        ]);

        $startDate = $request->start_date ? Carbon::parse($request->start_date) : Carbon::now()->startOfMonth();
        $endDate = $request->end_date ? Carbon::parse($request->end_date) : Carbon::now()->endOfMonth();

        $query = Product::with(['category', 'orderItems' => function($q) use ($startDate, $endDate) {
            $q->whereHas('order', function($orderQuery) use ($startDate, $endDate) {
                $orderQuery->whereBetween('created_at', [$startDate, $endDate]);
            });
        }]);

        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        $products = $query->get()->map(function($product) {
            $totalSold = $product->orderItems->sum('quantity');
            $totalRevenue = $product->orderItems->sum(function($item) {
                return $item->quantity * $item->price;
            });

            return [
                'id' => $product->id,
                'name' => $product->name,
                'category' => $product->category->name,
                'current_stock' => $product->stock_quantity,
                'min_stock' => $product->min_stock_quantity,
                'price' => $product->price,
                'total_sold' => $totalSold,
                'total_revenue' => $totalRevenue,
                'is_low_stock' => $product->stock_quantity <= $product->min_stock_quantity
            ];
        })->sortByDesc('total_sold')->values();

        // Produtos mais vendidos
        $topProducts = $products->take(10);

        // Produtos com estoque baixo
        $lowStockProducts = $products->where('is_low_stock', true);

        // Resumo
        $summary = [
            'total_products' => Product::count(),
            'active_products' => Product::where('is_active', true)->count(),
            'low_stock_products' => Product::whereColumn('stock_quantity', '<=', 'min_stock_quantity')->count(),
            'total_stock_value' => Product::sum('stock_quantity * price')
        ];

        return response()->json([
            'period' => [
                'start_date' => $startDate->toDateString(),
                'end_date' => $endDate->toDateString()
            ],
            'summary' => $summary,
            'top_products' => $topProducts,
            'low_stock_products' => $lowStockProducts,
            'all_products' => $products
        ]);
    }

    public function categories(Request $request): JsonResponse
    {
        $categories = Category::with(['products', 'children'])->get()->map(function($category) {
            $productsCount = $category->products()->count();
            $activeProductsCount = $category->products()->where('is_active', true)->count();
            $totalStockValue = $category->products()->sum('stock_quantity * price');
            $lowStockCount = $category->products()->whereColumn('stock_quantity', '<=', 'min_stock_quantity')->count();

            return [
                'id' => $category->id,
                'name' => $category->name,
                'parent' => $category->parent ? $category->parent->name : null,
                'children_count' => $category->children()->count(),
                'products_count' => $productsCount,
                'active_products_count' => $activeProductsCount,
                'total_stock_value' => $totalStockValue,
                'low_stock_count' => $lowStockCount,
                'is_active' => $category->is_active
            ];
        });

        // Categorias mais utilizadas
        $topCategories = $categories->sortByDesc('products_count')->take(10);

        // Categorias com estoque baixo
        $categoriesWithLowStock = $categories->where('low_stock_count', '>', 0);

        // Resumo
        $summary = [
            'total_categories' => Category::count(),
            'active_categories' => Category::where('is_active', true)->count(),
            'categories_with_products' => Category::has('products')->count(),
            'empty_categories' => Category::doesntHave('products')->count()
        ];

        return response()->json([
            'summary' => $summary,
            'top_categories' => $topCategories,
            'categories_with_low_stock' => $categoriesWithLowStock,
            'all_categories' => $categories
        ]);
    }

    public function users(Request $request): JsonResponse
    {
        $request->validate([
            'type' => 'nullable|in:admin,employee,customer'
        ]);

        $query = User::withCount(['orders']);

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        $users = $query->get()->map(function($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'type' => $user->type,
                'orders_count' => $user->orders_count,
                'total_spent' => $user->orders()->sum('total'),
                'last_order' => $user->orders()->latest()->first()?->created_at,
                'is_active' => $user->is_active,
                'created_at' => $user->created_at
            ];
        });

        // Usuários mais ativos
        $topUsers = $users->sortByDesc('orders_count')->take(10);

        // Usuários por tipo
        $usersByType = [
            'admin' => $users->where('type', 'admin')->count(),
            'employee' => $users->where('type', 'employee')->count(),
            'customer' => $users->where('type', 'customer')->count()
        ];

        // Resumo
        $summary = [
            'total_users' => User::count(),
            'active_users' => User::where('is_active', true)->count(),
            'users_with_orders' => User::has('orders')->count(),
            'new_users_this_month' => User::whereMonth('created_at', Carbon::now()->month)->count()
        ];

        return response()->json([
            'summary' => $summary,
            'users_by_type' => $usersByType,
            'top_users' => $topUsers,
            'all_users' => $users
        ]);
    }

    public function stock(Request $request): JsonResponse
    {
        $products = Product::with(['category', 'stockMovements'])->get()->map(function($product) {
            $movements = $product->stockMovements()->latest()->take(5)->get();
            
            return [
                'id' => $product->id,
                'name' => $product->name,
                'sku' => $product->sku,
                'category' => $product->category->name,
                'current_stock' => $product->stock_quantity,
                'min_stock' => $product->min_stock_quantity,
                'price' => $product->price,
                'stock_value' => $product->stock_quantity * $product->price,
                'is_low_stock' => $product->stock_quantity <= $product->min_stock_quantity,
                'is_out_of_stock' => $product->stock_quantity == 0,
                'recent_movements' => $movements->map(function($movement) {
                    return [
                        'type' => $movement->type,
                        'quantity' => $movement->quantity,
                        'reason' => $movement->reason,
                        'created_at' => $movement->created_at
                    ];
                })
            ];
        });

        // Produtos com estoque baixo
        $lowStockProducts = $products->where('is_low_stock', true);

        // Produtos sem estoque
        $outOfStockProducts = $products->where('is_out_of_stock', true);

        // Produtos com maior valor em estoque
        $topValueProducts = $products->sortByDesc('stock_value')->take(10);

        // Resumo
        $summary = [
            'total_products' => $products->count(),
            'low_stock_products' => $lowStockProducts->count(),
            'out_of_stock_products' => $outOfStockProducts->count(),
            'total_stock_value' => $products->sum('stock_value'),
            'average_stock_value' => $products->avg('stock_value')
        ];

        return response()->json([
            'summary' => $summary,
            'low_stock_products' => $lowStockProducts,
            'out_of_stock_products' => $outOfStockProducts,
            'top_value_products' => $topValueProducts,
            'all_products' => $products
        ]);
    }
}

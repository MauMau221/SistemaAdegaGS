<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use DB;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $userId = auth()->id();
        \Log::info('OrderController@index - User ID: ' . $userId);

        $query = Order::with(['items.product', 'user', 'payments']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        // Retornar apenas os pedidos do usuário autenticado
        $query->where('user_id', $userId);

        $orders = $query->latest()->get();
        \Log::info('OrderController@index - Orders found: ' . $orders->count());

        return $orders;
    }

    public function store(Request $request)
    {
        $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'type' => 'required|in:local,online',
            'delivery' => 'required_if:type,online|array',
            'delivery.address' => 'required_if:type,online|string',
            'delivery.number' => 'required_if:type,online|string',
            'delivery.neighborhood' => 'required_if:type,online|string',
            'delivery.city' => 'required_if:type,online|string',
            'delivery.state' => 'required_if:type,online|string',
            'delivery.zipcode' => 'required_if:type,online|string',
            'delivery.phone' => 'required_if:type,online|string',
            'payment' => 'required|array',
            'payment.method' => 'required|in:pix,cash,card',
            'payment.change' => 'required_if:payment.method,cash|nullable|numeric',
            'discount_code' => 'nullable|string',
            'notes' => 'nullable|string'
        ]);

        try {
            DB::beginTransaction();

            // Criar pedido
            $order = Order::create([
                'user_id' => auth()->id(),
                'order_number' => 'PED-' . strtoupper(Str::random(8)),
                'type' => $request->type,
                'status' => 'pending',
                'total_amount' => 0, // Será calculado depois
                'delivery_address' => $request->type === 'online' ? json_encode($request->delivery) : null,
                'payment_method' => $request->payment['method'],
                'payment_status' => 'pending',
                'discount_code' => $request->discount_code,
                'notes' => $request->notes
            ]);

            // Adicionar itens
            foreach ($request->items as $item) {
                $product = Product::findOrFail($item['product_id']);
                
                if ($product->stock_quantity < $item['quantity']) {
                    throw new \Exception("Produto {$product->name} não possui estoque suficiente");
                }

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'quantity' => $item['quantity'],
                    'unit_price' => $product->price,
                    'total_price' => $product->price * $item['quantity']
                ]);

                // Atualizar estoque
                $product->updateStock($item['quantity']);
            }

            // Calcular total
            $order->calculateTotal();
            
            // Recarregar o pedido para garantir que o total foi salvo
            $order->refresh();

            DB::commit();

            return response()->json($order->load(['items.product', 'user']), 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function show(Order $order)
    {
        return $order->load(['items.product', 'user', 'payments']);
    }

    public function updateStatus(Request $request, Order $order)
    {
        $request->validate([
            'status' => 'required|in:processing,paid,shipped,delivered,cancelled,refunded'
        ]);

        $order->status = $request->status;
        $order->save();

        return response()->json($order);
    }
}

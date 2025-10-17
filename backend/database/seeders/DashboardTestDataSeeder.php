<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Category;
use App\Models\Product;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DashboardTestDataSeeder extends Seeder
{
    public function run(): void
    {
        // Criar usuários de teste
        $admin = User::create([
            'name' => 'Admin Sistema',
            'email' => 'admin@adegags.com',
            'password' => Hash::make('password'),
            'type' => 'admin',
            'is_active' => true,
        ]);

        $employee = User::create([
            'name' => 'Funcionário Teste',
            'email' => 'funcionario@adegags.com',
            'password' => Hash::make('password'),
            'type' => 'employee',
            'is_active' => true,
        ]);

        // Criar clientes
        $customers = [];
        for ($i = 1; $i <= 15; $i++) {
            $customers[] = User::create([
                'name' => "Cliente {$i}",
                'email' => "cliente{$i}@teste.com",
                'password' => Hash::make('password'),
                'type' => 'customer',
                'is_active' => true,
                'created_at' => Carbon::now()->subDays(rand(1, 30)),
            ]);
        }

        // Criar categorias
        $categories = [];
        $categoryNames = ['Vinhos Tintos', 'Vinhos Brancos', 'Espumantes', 'Destilados', 'Cervejas'];
        
        foreach ($categoryNames as $name) {
            $categories[] = Category::create([
                'name' => $name,
                'slug' => strtolower(str_replace(' ', '-', $name)),
                'description' => "Categoria de {$name}",
                'is_active' => true,
            ]);
        }

        // Criar produtos
        $products = [];
        $productNames = [
            'Vinho Tinto Cabernet Sauvignon', 'Vinho Branco Chardonnay', 'Champagne Dom Pérignon',
            'Whisky Johnnie Walker', 'Cerveja Heineken', 'Vinho Tinto Merlot', 'Vinho Branco Sauvignon Blanc',
            'Prosecco Italiano', 'Vodka Absolut', 'Cerveja Corona', 'Vinho Tinto Pinot Noir',
            'Vinho Branco Riesling', 'Cava Espanhol', 'Rum Bacardi', 'Cerveja Stella Artois'
        ];

        foreach ($productNames as $index => $name) {
            $products[] = Product::create([
                'name' => $name,
                'description' => "Descrição do {$name}",
                'price' => rand(20, 200) + (rand(0, 99) / 100),
                'sku' => 'SKU' . str_pad($index + 1, 4, '0', STR_PAD_LEFT),
                'category_id' => $categories[array_rand($categories)]->id,
                'current_stock' => rand(0, 50),
                'min_stock' => 5,
                'is_active' => true,
            ]);
        }

        // Criar pedidos
        $orderStatuses = ['pending', 'delivering', 'completed', 'cancelled'];
        $paymentMethods = ['credit_card', 'debit_card', 'pix', 'cash'];

        for ($i = 1; $i <= 25; $i++) {
            $customer = $customers[array_rand($customers)];
            $status = $orderStatuses[array_rand($orderStatuses)];
            $createdAt = Carbon::now()->subDays(rand(0, 30));
            
            $order = Order::create([
                'user_id' => $customer->id,
                'status' => $status,
                'total' => 0, // Será calculado
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ]);

            // Adicionar itens ao pedido
            $numItems = rand(1, 4);
            $total = 0;
            
            for ($j = 0; $j < $numItems; $j++) {
                $product = $products[array_rand($products)];
                $quantity = rand(1, 3);
                $price = $product->price;
                
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'quantity' => $quantity,
                    'price' => $price,
                ]);
                
                $total += $quantity * $price;
            }

            // Atualizar total do pedido
            $order->update(['total' => $total]);

            // Criar pagamento
            Payment::create([
                'order_id' => $order->id,
                'payment_method' => $paymentMethods[array_rand($paymentMethods)],
                'amount' => $total,
                'status' => $status === 'completed' ? 'paid' : 'pending',
                'created_at' => $createdAt,
            ]);
        }

        $this->command->info('Dados de teste criados com sucesso!');
        $this->command->info('Admin: admin@adegags.com / password');
        $this->command->info('Funcionário: funcionario@adegags.com / password');
        $this->command->info('Clientes: cliente1@teste.com até cliente15@teste.com / password');
    }
}

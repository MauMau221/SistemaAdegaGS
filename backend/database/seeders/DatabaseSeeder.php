<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        // Criar usuário admin
        User::create([
            'name' => 'Administrador',
            'email' => 'admin@adegags.com',
            'password' => bcrypt('12345678'),
            'type' => 'admin',
            'is_active' => true
        ]);

        // Criar categorias
        $categories = [
            [
                'name' => 'Pack Cervejas Lata',
                'description' => 'Packs de cerveja em lata com ótimo custo-benefício',
                'is_active' => true
            ],
            [
                'name' => 'Pack Long Neck',
                'description' => 'Packs de cerveja long neck para todas as ocasiões',
                'is_active' => true
            ],
            [
                'name' => 'Bebidas Ice',
                'description' => 'Bebidas ice refrescantes e saborosas',
                'is_active' => true
            ],
            [
                'name' => 'Drinks',
                'description' => 'Drinks prontos para consumo',
                'is_active' => true
            ],
            [
                'name' => 'Energéticos',
                'description' => 'Energéticos para mais disposição',
                'is_active' => true
            ],
            [
                'name' => 'Bebidas Quentes',
                'description' => 'Destilados e licores premium',
                'is_active' => true
            ],
            [
                'name' => 'Refrigerantes',
                'description' => 'Refrigerantes de diversas marcas',
                'is_active' => true
            ],
            [
                'name' => 'Sucos',
                'description' => 'Sucos naturais e néctares',
                'is_active' => true
            ]
        ];

        foreach ($categories as $category) {
            Category::create([
                'name' => $category['name'],
                'slug' => Str::slug($category['name']),
                'description' => $category['description'],
                'is_active' => $category['is_active']
            ]);
        }

        // Array de produtos
        $products = [
            // Pack Cervejas Lata
            [
                'category_id' => 1,
                'name' => 'Pack Cerveja Brahma Duplo Malte Lata 350ml - 12 Unidades',
                'price' => 39.90,
                'cost_price' => 30.00,
                'stock_quantity' => 50,
                'featured' => true
            ],
            [
                'category_id' => 1,
                'name' => 'Pack Cerveja Original Lata 350ml - 12 Unidades',
                'price' => 45.90,
                'cost_price' => 35.00,
                'stock_quantity' => 40,
                'featured' => true
            ],
            [
                'category_id' => 1,
                'name' => 'Pack Cerveja Heineken Lata 350ml - 12 Unidades',
                'price' => 52.90,
                'cost_price' => 42.00,
                'stock_quantity' => 30,
                'featured' => true
            ],

            // Pack Long Neck
            [
                'category_id' => 2,
                'name' => 'Pack Cerveja Stella Artois Long Neck 275ml - 6 Unidades',
                'price' => 39.90,
                'cost_price' => 30.00,
                'stock_quantity' => 40,
                'featured' => false
            ],
            [
                'category_id' => 2,
                'name' => 'Pack Cerveja Budweiser Long Neck 330ml - 6 Unidades',
                'price' => 36.90,
                'cost_price' => 28.00,
                'stock_quantity' => 45,
                'featured' => true
            ],

            // Bebidas Ice
            [
                'category_id' => 3,
                'name' => 'Smirnoff Ice 275ml',
                'price' => 9.90,
                'cost_price' => 7.00,
                'stock_quantity' => 100,
                'featured' => true
            ],
            [
                'category_id' => 3,
                'name' => 'Skol Beats Senses 313ml',
                'price' => 8.90,
                'cost_price' => 6.50,
                'stock_quantity' => 80,
                'featured' => false
            ],

            // Energéticos
            [
                'category_id' => 5,
                'name' => 'Red Bull Energy Drink 250ml',
                'price' => 9.90,
                'cost_price' => 7.50,
                'stock_quantity' => 100,
                'featured' => true
            ],
            [
                'category_id' => 5,
                'name' => 'Monster Energy 473ml',
                'price' => 11.90,
                'cost_price' => 8.50,
                'stock_quantity' => 80,
                'featured' => true
            ],

            // Bebidas Quentes
            [
                'category_id' => 6,
                'name' => 'Whisky Jack Daniels 1L',
                'price' => 159.90,
                'cost_price' => 120.00,
                'stock_quantity' => 20,
                'featured' => true
            ],
            [
                'category_id' => 6,
                'name' => 'Vodka Absolut Original 750ml',
                'price' => 89.90,
                'cost_price' => 65.00,
                'stock_quantity' => 30,
                'featured' => false
            ],
            [
                'category_id' => 6,
                'name' => 'Gin Tanqueray 750ml',
                'price' => 129.90,
                'cost_price' => 95.00,
                'stock_quantity' => 25,
                'featured' => true
            ],

            // Refrigerantes
            [
                'category_id' => 7,
                'name' => 'Coca-Cola 2L',
                'price' => 9.90,
                'cost_price' => 7.00,
                'stock_quantity' => 100,
                'featured' => false
            ],
            [
                'category_id' => 7,
                'name' => 'Guaraná Antarctica 2L',
                'price' => 8.90,
                'cost_price' => 6.00,
                'stock_quantity' => 100,
                'featured' => false
            ],
            [
                'category_id' => 7,
                'name' => 'Fanta Laranja 2L',
                'price' => 8.90,
                'cost_price' => 6.00,
                'stock_quantity' => 80,
                'featured' => false
            ],

            // Sucos
            [
                'category_id' => 8,
                'name' => 'Del Valle Uva 1L',
                'price' => 7.90,
                'cost_price' => 5.00,
                'stock_quantity' => 60,
                'featured' => false
            ],
            [
                'category_id' => 8,
                'name' => 'Suco Natural One Laranja 1.5L',
                'price' => 14.90,
                'cost_price' => 10.00,
                'stock_quantity' => 40,
                'featured' => true
            ]
        ];

        // Criar produtos
        foreach ($products as $product) {
            Product::create([
                'category_id' => $product['category_id'],
                'name' => $product['name'],
                'slug' => Str::slug($product['name']),
                'description' => $product['name'],
                'price' => $product['price'],
                'cost_price' => $product['cost_price'],
                'stock_quantity' => $product['stock_quantity'],
                'min_stock_quantity' => 10,
                'sku' => Str::upper(Str::random(8)),
                'is_active' => true,
                'featured' => $product['featured'],
                'images' => []
            ]);
        }
    }
}
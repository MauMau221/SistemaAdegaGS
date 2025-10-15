<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stock_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['entrada', 'saida', 'ajuste']);
            $table->integer('quantity');
            $table->text('description')->nullable();
            $table->decimal('unit_cost', 10, 2)->nullable();
            $table->timestamps();
        });

        // Adicionar coluna de estoque atual na tabela de produtos
        Schema::table('products', function (Blueprint $table) {
            $table->integer('current_stock')->default(0)->after('price');
            $table->integer('min_stock')->default(5)->after('current_stock');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_movements');
        
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['current_stock', 'min_stock']);
        });
    }
};

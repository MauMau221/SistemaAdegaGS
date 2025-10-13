<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('financial_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->nullable()->constrained();
            $table->enum('type', ['income', 'expense']);
            $table->enum('category', [
                'sale',
                'purchase',
                'refund',
                'tax',
                'fee',
                'salary',
                'rent',
                'utility',
                'other'
            ]);
            $table->decimal('amount', 10, 2);
            $table->text('description')->nullable();
            $table->date('transaction_date');
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down()
    {
        Schema::dropIfExists('financial_transactions');
    }
};

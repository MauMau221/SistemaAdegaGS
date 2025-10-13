<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained();
            $table->string('transaction_id')->nullable();
            $table->enum('payment_method', [
                'credit_card',
                'debit_card',
                'pix',
                'cash',
                'other'
            ]);
            $table->enum('status', [
                'pending',
                'processing',
                'approved',
                'declined',
                'refunded',
                'cancelled'
            ])->default('pending');
            $table->decimal('amount', 10, 2);
            $table->json('payment_details')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down()
    {
        Schema::dropIfExists('payments');
    }
};

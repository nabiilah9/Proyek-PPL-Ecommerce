<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('transaction_details', function (Blueprint $table) {
            $table->id();

            $table->foreignId('transaction_id')->constrained(
                table: 'transactions',
                column: 'id',
            );
            $table->foreignId('item_id')->constrained(
                table: 'items',
                column: 'id',
            );
            $table->integer('quantity');
            $table->decimal('price_at_time', 10, 2);

            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('transaction_details');
    }
};
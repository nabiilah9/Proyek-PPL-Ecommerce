<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('items', function (Blueprint $table) {
            $table->id();

            $table->foreignId('category_id')->constrained(
                table: 'categories',
                column: 'id',
            )->nullable();
            $table->string('name', 100);
            $table->string('unit', 20)->default('pcs'); // E.g., 'pcs', 'pack', 'kg'
            $table->integer('price');
            $table->integer('stock');
            $table->string('image_url');
            $table->boolean('is_available')->default(true); // Toggle for visibility
            $table->longText('description')->nullable();
            $table->float('discount')->default(0);
            $table->date('expired_at');

            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('items');
    }
};
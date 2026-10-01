<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('ratings', function (Blueprint $table) {
            $table->id();

            $table->foreignId('item_id')->constrained(
                table: 'items',
                column: 'id',
            );
            $table->tinyInteger('score');
            $table->string('comment')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('ratings');
    }
};

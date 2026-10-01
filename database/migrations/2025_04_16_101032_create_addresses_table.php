<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('addresses', function (Blueprint $table) {
            $table->id();

            $table->foreignId("contact_id")->constrained(
                table: "contacts",
                column: "id",
            );

            $table->string("post_code", 10);
            $table->string("country", 100);
            $table->string("province", 100);
            $table->string("city", 100);
            $table->string("street", 200);
            $table->string("more", 50)->nullable();

            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('addresses');
    }
};
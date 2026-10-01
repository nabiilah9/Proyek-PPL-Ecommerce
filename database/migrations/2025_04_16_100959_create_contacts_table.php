<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('contacts', function (Blueprint $table) {
            $table->id();

            $table->foreignId("user_id")->constrained(
                table: "users",
                column: "id",
            );

            $table->string("name", 100)->nullable(false);
            $table->string("phone", 20)->nullable(false);
            $table->string("profile")->nullable(true);
            $table->enum("gender", ["MAN", "WOMAN"])->nullable(false);
            $table->date("birthday")->nullable(false);
            $table->json('favourite')->nullable(true);

            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void {
        Schema::dropIfExists('contacts');
    }
};

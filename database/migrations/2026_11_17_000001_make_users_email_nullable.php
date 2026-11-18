<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * PPL-01 — registrasi cukup username + password, email jadi opsional.
 * Kolom email tetap unique; beberapa NULL diizinkan (SQLite & MySQL).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('email', 40)->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('email', 40)->nullable(false)->change();
        });
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('google_id')->nullable()->unique()->after('id');
            $table->string('name')->nullable()->after('username'); // Untuk menyimpan nama dari Google
            $table->string('password')->nullable()->change(); // Memungkinkan password null untuk login sosial
            $table->string('username')->nullable()->change(); // Memungkinkan username null awalnya jika diisi nanti
            $table->text('google_token')->nullable();
            $table->text('google_refresh_token')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['google_id', 'name', 'google_token', 'google_refresh_token']);
            $table->string('password')->nullable(false)->change();
            $table->string('username')->nullable(false)->change();
        });
    }
};
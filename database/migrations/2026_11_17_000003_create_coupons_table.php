<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * PPL-10 — kode diskon dengan Rule-Based System.
 *
 * Aturan disimpan sebagai data (bukan hardcode di controller) supaya admin
 * bisa menambah promo tanpa mengubah kode.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('coupons', function (Blueprint $table) {
            $table->id();
            $table->string('code', 30)->unique();
            $table->string('description')->nullable();

            // percent = potongan persen, fixed = potongan rupiah
            $table->string('type', 10)->default('percent');
            $table->unsignedInteger('value');

            $table->unsignedInteger('min_spend')->default(0);
            $table->unsignedInteger('max_discount')->nullable(); // batas atas untuk tipe percent

            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();

            $table->unsignedInteger('usage_limit')->nullable();
            $table->unsignedInteger('used_count')->default(0);

            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::table('transactions', function (Blueprint $table) {
            $table->foreignId('coupon_id')->nullable()->after('note')
                ->constrained('coupons')->nullOnDelete();
            $table->string('coupon_code', 30)->nullable()->after('coupon_id');
            $table->unsignedInteger('coupon_discount')->default(0)->after('coupon_code');
        });
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropConstrainedForeignId('coupon_id');
            $table->dropColumn(['coupon_code', 'coupon_discount']);
        });

        Schema::dropIfExists('coupons');
    }
};

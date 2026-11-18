<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * PPL-03 — admin memverifikasi pesanan dan memperbarui status pengiriman.
 *
 * status          : status pembayaran (pending, paid, canceled, failed) — tidak diubah
 * shipping_status : status pemenuhan pesanan (pending, packed, shipped, delivered)
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->string('shipping_status', 20)->default('pending')->after('status');
            $table->string('tracking_number', 50)->nullable()->after('shipping_status');
            $table->timestamp('packed_at')->nullable()->after('tracking_number');
            $table->timestamp('shipped_at')->nullable()->after('packed_at');
            $table->timestamp('delivered_at')->nullable()->after('shipped_at');
            $table->foreignId('verified_by')->nullable()->after('delivered_at')
                ->constrained('users')->nullOnDelete();
            $table->timestamp('verified_at')->nullable()->after('verified_by');

            $table->index(['status', 'shipping_status']);
        });
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropIndex(['status', 'shipping_status']);
            $table->dropConstrainedForeignId('verified_by');
            $table->dropColumn([
                'shipping_status',
                'tracking_number',
                'packed_at',
                'shipped_at',
                'delivered_at',
                'verified_at',
            ]);
        });
    }
};

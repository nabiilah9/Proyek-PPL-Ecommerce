<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('items', function (Blueprint $table) {
            $table->unsignedInteger('weight')->default(500)->after('unit'); // gram
        });

        Schema::table('transactions', function (Blueprint $table) {
            $table->string('delivery_method', 10)->default('delivery')->after('payment_method');
            $table->string('recipient_name', 100)->nullable()->after('delivery_method');
            $table->string('recipient_phone', 20)->nullable()->after('recipient_name');
            $table->text('shipping_address')->nullable()->after('recipient_phone');
            $table->unsignedBigInteger('shipping_destination_id')->nullable()->after('shipping_address');
            $table->string('shipping_courier', 20)->nullable()->after('shipping_destination_id');
            $table->string('shipping_service', 50)->nullable()->after('shipping_courier');
            $table->string('shipping_etd', 50)->nullable()->after('shipping_service');
            $table->unsignedInteger('shipping_cost')->default(0)->after('shipping_etd');
        });
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn([
                'delivery_method',
                'recipient_name',
                'recipient_phone',
                'shipping_address',
                'shipping_destination_id',
                'shipping_courier',
                'shipping_service',
                'shipping_etd',
                'shipping_cost',
            ]);
        });
        Schema::table('items', fn(Blueprint $table) => $table->dropColumn('weight'));
    }
};

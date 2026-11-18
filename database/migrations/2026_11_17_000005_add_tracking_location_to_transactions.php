<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('transactions', function (Blueprint $table) {
            $table->string('current_location_note')->nullable()->after('tracking_number');
            $table->decimal('current_latitude', 10, 7)->nullable()->after('current_location_note');
            $table->decimal('current_longitude', 10, 7)->nullable()->after('current_latitude');
            $table->timestamp('location_updated_at')->nullable()->after('current_longitude');
        });
    }

    public function down(): void {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn([
                'current_location_note',
                'current_latitude',
                'current_longitude',
                'location_updated_at',
            ]);
        });
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->timestamp('received_at')->nullable();
        });

        Schema::table('ratings', function (Blueprint $table) {
            $table->foreignId('user_id')
                ->nullable()
                ->after('item_id')
                ->constrained('users')
                ->nullOnDelete();

            $table->foreignId('transaction_id')
                ->nullable()
                ->after('user_id')
                ->constrained('transactions')
                ->nullOnDelete();

            $table->unique(
                ['transaction_id', 'item_id'],
                'ratings_transaction_item_unique'
            );
        });
    }

    public function down(): void
    {
        Schema::table('ratings', function (Blueprint $table) {
            $table->dropUnique('ratings_transaction_item_unique');
            $table->dropConstrainedForeignId('transaction_id');
            $table->dropConstrainedForeignId('user_id');
        });

        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn('received_at');
        });
    }
};

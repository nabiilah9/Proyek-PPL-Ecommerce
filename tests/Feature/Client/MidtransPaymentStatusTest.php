<?php

namespace Tests\Feature\Client;

use App\Models\Item;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use App\Models\User;
use App\Services\MidtransService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Pembayaran DANA / e-wallet: status pesanan harus ikut berubah
 * tanpa membuat halaman konfirmasi error.
 */
class MidtransPaymentStatusTest extends TestCase
{
    use RefreshDatabase;

    public function test_sandbox_rejects_production_server_key(): void
    {
        config([
            'services.midtrans.is_production' => false,
            'services.midtrans.server_key' => 'Mid-server-example',
        ]);

        $issue = app(MidtransService::class)->configurationIssue();

        $this->assertNotNull($issue);
        $this->assertStringContainsString('sandbox', $issue);
    }

    private function ewalletOrder(array $attributes = []): Transaction
    {
        return Transaction::factory()->create(array_merge([
            'payment_method' => 'e-wallet',
            'status' => 'pending',
            'midtrans_order_id' => 'PPL-99-ABCDEFGHIJKLMNOP',
            'total' => 50000,
        ], $attributes));
    }

    private function notify(Transaction $transaction, array $payload): void
    {
        app(MidtransService::class)->applyNotification(array_merge([
            'order_id' => $transaction->midtrans_order_id,
        ], $payload));
    }

    public function test_settlement_dana_menandai_pesanan_lunas(): void
    {
        $transaction = $this->ewalletOrder();

        $this->notify($transaction, [
            'transaction_status' => 'settlement',
            'fraud_status' => 'accept',
            'payment_type' => 'dana',
        ]);

        $transaction->refresh();

        $this->assertSame('paid', $transaction->status);
        $this->assertSame('dana', $transaction->payment_type);
        $this->assertNotNull($transaction->paid_at);
    }

    public function test_capture_dengan_fraud_accept_dianggap_lunas(): void
    {
        $transaction = $this->ewalletOrder();

        $this->notify($transaction, [
            'transaction_status' => 'capture',
            'fraud_status' => 'accept',
            'payment_type' => 'dana',
        ]);

        $this->assertSame('paid', $transaction->refresh()->status);
    }

    public function test_capture_challenge_tetap_pending_tapi_menyimpan_metode(): void
    {
        $transaction = $this->ewalletOrder();

        $this->notify($transaction, [
            'transaction_status' => 'capture',
            'fraud_status' => 'challenge',
            'payment_type' => 'dana',
        ]);

        $transaction->refresh();

        $this->assertSame('pending', $transaction->status);
        $this->assertSame('dana', $transaction->payment_type);
        $this->assertNull($transaction->paid_at);
    }

    public function test_expire_mengembalikan_stok(): void
    {
        $item = Item::factory()->create(['stock' => 5]);
        $transaction = $this->ewalletOrder();

        TransactionDetail::factory()->create([
            'transaction_id' => $transaction->id,
            'item_id' => $item->id,
            'quantity' => 2,
        ]);

        $this->notify($transaction, ['transaction_status' => 'expire']);

        $this->assertSame('canceled', $transaction->refresh()->status);
        $this->assertSame(7, $item->refresh()->stock);
    }

    public function test_status_endpoint_hanya_bisa_dibuka_pemilik(): void
    {
        $transaction = $this->ewalletOrder(['midtrans_order_id' => null]);

        $this->actingAs($transaction->user)
            ->getJson(route('client.orders.status', $transaction))
            ->assertOk()
            ->assertJsonPath('status', 'pending');

        $other = User::factory()->client()->create();

        $this->actingAs($other)
            ->getJson(route('client.orders.status', $transaction))
            ->assertForbidden();
    }
}

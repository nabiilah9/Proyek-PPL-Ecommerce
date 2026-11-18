<?php

namespace Tests\Feature\Admin;

use App\Models\Item;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/**
 * PPL-03 — admin memantau transaksi, memverifikasi pesanan, update status kirim.
 */
class TransactionManagementTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::factory()->admin()->create();
    }

    private function order(array $attributes = []): Transaction
    {
        return Transaction::factory()->create($attributes);
    }

    public function test_admin_sees_transaction_list(): void
    {
        $this->order(['status' => 'pending']);

        $this->actingAs($this->admin())
            ->get(route('transactions.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admins/transactions/index')
                ->has('transactions.data', 1)
                ->has('summary')
                ->has('filters')
            );
    }

    public function test_index_filters_by_status(): void
    {
        $this->order(['status' => 'pending']);
        $this->order(['status' => 'paid']);

        $this->actingAs($this->admin())
            ->get(route('transactions.index', ['status' => 'paid']))
            ->assertInertia(fn (Assert $page) => $page
                ->has('transactions.data', 1)
                ->where('transactions.data.0.status', 'paid')
            );
    }

    public function test_admin_sees_transaction_detail(): void
    {
        $transaction = $this->order();

        $this->actingAs($this->admin())
            ->get(route('transactions.show', $transaction))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admins/transactions/show')
                ->where('transaction.id', $transaction->id)
            );
    }

    public function test_admin_verifies_pending_order(): void
    {
        $admin = $this->admin();
        $transaction = $this->order(['status' => 'pending']);

        $this->actingAs($admin)
            ->post(route('transactions.verify', $transaction))
            ->assertRedirect();

        $transaction->refresh();

        $this->assertSame('paid', $transaction->status);
        $this->assertSame($admin->id, (int) $transaction->verified_by);
        $this->assertNotNull($transaction->verified_at);
        $this->assertNotNull($transaction->paid_at);
    }

    public function test_already_paid_order_cannot_be_verified_again(): void
    {
        $transaction = $this->order(['status' => 'paid']);

        $this->actingAs($this->admin())
            ->post(route('transactions.verify', $transaction))
            ->assertSessionHas('error');

        $this->assertSame('paid', $transaction->fresh()->status);
    }

    public function test_shipping_requires_paid_status(): void
    {
        $transaction = $this->order(['status' => 'pending']);

        $this->actingAs($this->admin())
            ->patch(route('transactions.shipping', $transaction), [
                'shipping_status' => 'packed',
            ])
            ->assertSessionHas('error');

        $this->assertSame('pending', $transaction->fresh()->shipping_status);
    }

    public function test_shipping_flow_moves_forward_and_stamps_time(): void
    {
        $transaction = $this->order(['status' => 'paid', 'shipping_status' => 'pending']);

        $this->actingAs($this->admin())
            ->patch(route('transactions.shipping', $transaction), [
                'shipping_status' => 'packed',
            ])->assertSessionHas('success');

        $this->assertSame('packed', $transaction->fresh()->shipping_status);
        $this->assertNotNull($transaction->fresh()->packed_at);

        $this->actingAs($this->admin())
            ->patch(route('transactions.shipping', $transaction), [
                'shipping_status' => 'shipped',
                'tracking_number' => 'JNE1234567890',
            ])->assertSessionHas('success');

        $transaction->refresh();

        $this->assertSame('shipped', $transaction->shipping_status);
        $this->assertSame('JNE1234567890', $transaction->tracking_number);
        $this->assertNotNull($transaction->shipped_at);

        $this->actingAs($this->admin())
            ->patch(route('transactions.shipping', $transaction), [
                'shipping_status' => 'delivered',
            ])->assertSessionHas('success');

        $this->assertSame('delivered', $transaction->fresh()->shipping_status);
        $this->assertNotNull($transaction->fresh()->delivered_at);
    }

    public function test_shipping_cannot_move_backwards(): void
    {
        $transaction = $this->order(['status' => 'paid', 'shipping_status' => 'shipped']);

        $this->actingAs($this->admin())
            ->patch(route('transactions.shipping', $transaction), [
                'shipping_status' => 'packed',
            ])
            ->assertSessionHas('error');

        $this->assertSame('shipped', $transaction->fresh()->shipping_status);
    }

    public function test_shipped_requires_tracking_number(): void
    {
        $transaction = $this->order(['status' => 'paid', 'shipping_status' => 'packed']);

        $this->actingAs($this->admin())
            ->patch(route('transactions.shipping', $transaction), [
                'shipping_status' => 'shipped',
            ])
            ->assertSessionHas('error');

        $this->assertSame('packed', $transaction->fresh()->shipping_status);
    }

    public function test_canceling_unpaid_order_returns_stock(): void
    {
        $item = Item::factory()->create(['stock' => 4]);

        $transaction = $this->order(['status' => 'pending']);

        TransactionDetail::factory()->create([
            'transaction_id' => $transaction->id,
            'item_id' => $item->id,
            'quantity' => 3,
            'price_at_time' => 10000,
        ]);

        $this->actingAs($this->admin())
            ->delete(route('transactions.destroy', $transaction))
            ->assertRedirect(route('transactions.index'));

        $this->assertDatabaseMissing('transactions', ['id' => $transaction->id]);
        $this->assertSame(7, (int) $item->fresh()->stock);
    }

    public function test_paid_order_cannot_be_deleted(): void
    {
        $transaction = $this->order(['status' => 'paid']);

        $this->actingAs($this->admin())
            ->delete(route('transactions.destroy', $transaction))
            ->assertSessionHas('error');

        $this->assertDatabaseHas('transactions', ['id' => $transaction->id]);
    }
}

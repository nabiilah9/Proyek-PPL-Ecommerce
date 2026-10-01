<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Item;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CartController extends Controller
{
    public function index()
    {
        // Get cart items from session or database
        $cartItems = session('cart', []);
        $items = [];
        $subtotal = 0;
        $discount = 0;

        if (!empty($cartItems)) {
            foreach ($cartItems as $itemId => $quantity) {
                $item = Item::with('category')->find($itemId);
                if ($item) {
                    $itemTotal = $item->price * $quantity;
                    $itemDiscount = $itemTotal * ($item->discount / 100);
                    
                    $items[] = [
                        'id' => $item->id,
                        'name' => $item->name,
                        'price' => $item->price,
                        'quantity' => $quantity,
                        'unit' => $item->unit,
                        'discount' => $item->discount,
                        'total' => $itemTotal,
                        'discounted_total' => $itemTotal - $itemDiscount
                    ];
                    
                    $subtotal += $itemTotal;
                    $discount += $itemDiscount;
                }
            }
        }

        $shipping = 0; // Free shipping
        $total = $subtotal - $discount + $shipping;

        return Inertia::render('clients/Cart', [
            'items' => $items,
            'subtotal' => $subtotal,
            'discount' => $discount,
            'shipping' => $shipping,
            'total' => $total
        ]);
    }

    public function addToCart(Request $request)
    {
        $request->validate([
            'item_id' => 'required|exists:items,id',
            'quantity' => 'required|integer|min:1'
        ]);

        $cart = session('cart', []);
        $itemId = $request->item_id;
        $quantity = $request->quantity;

        if (isset($cart[$itemId])) {
            $cart[$itemId] += $quantity;
        } else {
            $cart[$itemId] = $quantity;
        }

        session(['cart' => $cart]);

        return back()->with('success', 'Item added to cart successfully!');
    }

    public function updateCart(Request $request)
    {
        $request->validate([
            'item_id' => 'required|exists:items,id',
            'quantity' => 'required|integer|min:0'
        ]);

        $cart = session('cart', []);
        $itemId = $request->item_id;
        $quantity = $request->quantity;

        if ($quantity > 0) {
            $cart[$itemId] = $quantity;
        } else {
            unset($cart[$itemId]);
        }

        session(['cart' => $cart]);

        return back()->with('success', 'Cart updated successfully!');
    }

    public function removeFromCart(Request $request)
    {
        $request->validate([
            'item_id' => 'required|exists:items,id'
        ]);

        $cart = session('cart', []);
        unset($cart[$request->item_id]);
        session(['cart' => $cart]);

        return back()->with('success', 'Item removed from cart successfully!');
    }

    public function checkout(Request $request)
    {
        $request->validate([
            'payment_method' => 'required|in:cash,bank,e-wallet',
            'note' => 'nullable|string|max:1000'
        ]);

        $cart = session('cart', []);
        
        if (empty($cart)) {
            return back()->with('error', 'Your cart is empty!');
        }

        DB::beginTransaction();
        
        try {
            $subtotal = 0;
            $discount = 0;
            $transactionItems = [];

            // Calculate totals and prepare transaction items
            foreach ($cart as $itemId => $quantity) {
                $item = Item::find($itemId);
                if (!$item || $item->stock < $quantity) {
                    throw new \Exception("Insufficient stock for item: {$item->name}");
                }

                $itemTotal = $item->price * $quantity;
                $itemDiscount = $itemTotal * ($item->discount / 100);
                
                $transactionItems[] = [
                    'item' => $item,
                    'quantity' => $quantity,
                    'price_at_time' => $item->price
                ];

                $subtotal += $itemTotal;
                $discount += $itemDiscount;
            }

            $total = $subtotal - $discount;

            // Create transaction
            $transaction = Transaction::create([
                'client_id' => Auth::id(),
                'total' => $total,
                'note' => $request->note,
                'payment_method' => $request->payment_method,
                'status' => 'pending'
            ]);

            // Create transaction details and update stock
            foreach ($transactionItems as $transactionItem) {
                TransactionDetail::create([
                    'transaction_id' => $transaction->id,
                    'item_id' => $transactionItem['item']->id,
                    'quantity' => $transactionItem['quantity'],
                    'price_at_time' => $transactionItem['price_at_time']
                ]);

                // Update item stock
                $transactionItem['item']->decrement('stock', $transactionItem['quantity']);
            }

            // Clear cart
            session()->forget('cart');

            DB::commit();

            return redirect()->route('client.orders.show', $transaction->id)
                ->with('success', 'Order placed successfully!');

        } catch (\Exception $e) {
            DB::rollback();
            return back()->with('error', 'Failed to place order: ' . $e->getMessage());
        }
    }
}
<?php

namespace App\Http\Controllers\Admin;

use App\Models\Item;
use App\Models\Category;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreItemRequest;
use App\Http\Requests\UpdateItemRequest;
use Inertia\Inertia;

class AdminItemController extends Controller
{
    /**
     * Tampilkan semua produk.
     */
    public function index()
    {
        $items = Item::with('category')
            ->latest()
            ->get();

        return Inertia::render('admins/products/index', [
            'items' => $items,
        ]);
    }

    /**
     * Form tambah produk baru.
     */
    public function create()
    {
        $categories = Category::all(['id', 'name']);

        return Inertia::render('admins/products/create', [
            'categories' => $categories,
        ]);
    }

    /**
     * Simpan produk baru ke database.
     */
    public function store(StoreItemRequest $request)
    {
        Item::create([
            'category_id'  => $request->category_id,
            'name'         => $request->name,
            'unit'         => $request->unit ?? 'pcs',
            'price'        => $request->price,
            'stock'        => $request->stock,
            'image_url'    => $request->image_url ?? '',
            'is_available' => $request->boolean('is_available', true),
            'description'  => $request->description,
            'discount'     => $request->discount ?? 0,
            'expired_at'   => $request->expired_at,
        ]);

        return redirect()
            ->route('items.index')
            ->with('success', 'Produk berhasil ditambahkan.');
    }

    /**
     * Tampilkan detail produk (opsional).
     */
    public function show(Item $item)
    {
        return Inertia::render('admins/products/show', [
            'item' => $item->load('category'),
        ]);
    }

    /**
     * Form edit produk.
     */
    public function edit(Item $item)
    {
        $categories = Category::all(['id', 'name']);

        return Inertia::render('admins/products/edit', [
            'item'       => $item->load('category'),
            'categories' => $categories,
        ]);
    }

    /**
     * Update produk di database.
     */
    public function update(UpdateItemRequest $request, Item $item)
    {
        $item->update([
            'category_id'  => $request->category_id,
            'name'         => $request->name,
            'unit'         => $request->unit,
            'price'        => $request->price,
            'stock'        => $request->stock,
            'image_url'    => $request->image_url ?? $item->image_url,
            'is_available' => $request->boolean('is_available', true),
            'description'  => $request->description,
            'discount'     => $request->discount ?? 0,
            'expired_at'   => $request->expired_at,
        ]);

        return redirect()
            ->route('items.index')
            ->with('success', 'Produk berhasil diperbarui.');
    }

    /**
     * Hapus produk dari database.
     */
    public function destroy(Item $item)
    {
        $item->delete();

        return redirect()
            ->route('items.index')
            ->with('success', 'Produk berhasil dihapus.');
    }
}
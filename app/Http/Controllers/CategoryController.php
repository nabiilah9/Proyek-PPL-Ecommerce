<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Item;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $categories = Category::orderBy('name')->get();

        $search = trim((string) $request->query('search', ''));

        // Katalog seluruh produk yang tersedia.
        $produk = Item::query()
            ->where('is_available', true)
            ->where('stock', '>', 0)
            ->get();

        // Hasil pencarian.
        $products = [];

        if ($search !== '') {
            $products = Item::query()
                ->where('is_available', true)
                ->where('stock', '>', 0)
                ->where(function ($query) use ($search) {
                    $query->where('name', 'like', '%' . $search . '%')
                        ->orWhere('description', 'like', '%' . $search . '%');
                })
                ->get();
        }

        return Inertia::render('clients/menu', [
            'categories' => $categories,
            'produk' => $produk,
            'products' => $products,
            'search' => $search,
        ]);
    }

    public function show($slug)
    {
        $category = Category::where('slug', $slug)->firstOrFail();

        $categories = Category::orderBy('name')->get();

        $produk = $category->items()
            ->where('is_available', true)
            ->where('stock', '>', 0)
            ->get();

        return Inertia::render('clients/kategori', [
            'kategori' => $category->name,
            'slug' => $category->slug,
            'categories' => $categories,
            'produk' => $produk,
        ]);
    }
}
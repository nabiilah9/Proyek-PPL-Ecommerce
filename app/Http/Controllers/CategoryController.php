<?php
namespace App\Http\Controllers;

use App\Models\Category;
use Inertia\Inertia;

class CategoryController extends Controller {
    public function index() {
        $categories = Category::all();

        return Inertia::render('clients/menu', [
            'categories' => $categories
        ]);
    }

    public function show($slug) {
        $category = Category::where('slug', $slug)->firstOrFail();
        $items = $category->items()->where('is_available', true)->get();

        return Inertia::render('clients/kategori', [
            'kategori' => $category->name,
            'produk' => $items
        ]);
    }
}
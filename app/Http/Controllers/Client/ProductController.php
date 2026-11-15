<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Item;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function show(Item $item)
    {
        $item->load([
            'category',
            'ratings.user',
        ]);

        return Inertia::render('clients/product-detail', [
            'item' => $item,
        ]);
    }
}

<?php

namespace App\Http\Controllers\Admin;

use App\Models\Category;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use Inertia\Inertia;

class AdminCategoryController extends Controller {
    public function index() {
        return Inertia::render('admins/categories/index');
    }

    public function create() {
        //
    }

    public function store(StoreCategoryRequest $request) {
        //
    }

    public function show(Category $category) {
        //
    }

    public function edit(Category $category) {
        //
    }

    public function update(UpdateCategoryRequest $request, Category $category) {
        //
    }

    public function destroy(Category $category) {
        //
    }
}
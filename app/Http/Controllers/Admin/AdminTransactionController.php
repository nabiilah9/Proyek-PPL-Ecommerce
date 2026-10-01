<?php

namespace App\Http\Controllers\Admin;

use App\Models\Transaction;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTransactionRequest;
use App\Http\Requests\UpdateTransactionRequest;

class AdminTransactionController extends Controller {
    public function index() {
        //
    }

    public function create() {
        //
    }

    public function store(StoreTransactionRequest $request) {
        //
    }

    public function show(Transaction $transaction) {
        //
    }

    public function edit(Transaction $transaction) {
        //
    }

    public function update(UpdateTransactionRequest $request, Transaction $transaction) {
        //
    }

    public function destroy(Transaction $transaction) {
        //
    }
}
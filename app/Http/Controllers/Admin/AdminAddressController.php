<?php

namespace App\Http\Controllers\Admin;

use App\Models\Address;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAddressRequest;
use App\Http\Requests\UpdateAddressRequest;
use App\Http\Resources\AddressResource;
use Inertia\Inertia;

class AdminAddressController extends Controller {
    public function index() {
        $address = Address::all();

        return Inertia::render('admins/address/index', [
            'address' => AddressResource::collection($address),
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    public function create() {
        //
    }

    public function store(StoreAddressRequest $request) {
        //
    }

    public function show(Address $address) {
        //
    }

    public function edit(Address $address) {
        //
    }

    public function update(UpdateAddressRequest $request, Address $address) {
        //
    }

    public function destroy(Address $address) {
        //
    }
}
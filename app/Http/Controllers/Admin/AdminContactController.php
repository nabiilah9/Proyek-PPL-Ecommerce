<?php

namespace App\Http\Controllers\Admin;

use App\Models\Contact;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreContactRequest;
use App\Http\Requests\UpdateContactRequest;
use App\Http\Resources\ContactResource;
use Inertia\Inertia;

class AdminContactController extends Controller {
    public function index() {
        $contacts = Contact::all();

        return Inertia::render('admins/contacts/index', [
            'contacts' => ContactResource::collection($contacts),
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    public function create() {
        //
    }

    public function store(StoreContactRequest $request) {
        //
    }

    public function show(Contact $contact) {
        //
    }

    public function edit(Contact $contact) {
        //
    }

    public function update(UpdateContactRequest $request, Contact $contact) {
        //
    }

    public function destroy(Contact $contact) {
        //
    }
}
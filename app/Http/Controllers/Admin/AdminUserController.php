<?php

namespace App\Http\Controllers\Admin;

use Inertia\Inertia;
use App\Models\User;
use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use Illuminate\Support\Facades\Log;

class AdminUserController extends Controller {
    public function index() {
        $users = User::withTrashed()->get();

        return Inertia::render('admins/users/index', [
            'users' => UserResource::collection($users),
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    public function create() {
        return Inertia::render('admins/users/create', [
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    public function store(StoreUserRequest $request) {
        try {
            $validated = $request->validated();

            if ($validated['password'] != $request['password_confirmation']) {
                return redirect()->back()->with('error', 'Passwords do not match.');
            }

            $validated['password'] = bcrypt($validated['password']);

            User::create($validated);

            return redirect()->route('users.index')->with('success', 'User created successfully.');
        } catch (\Exception $e) {
            Log::error($e->getMessage());

            return redirect()->back()->with('error', 'Failed to create user.');
        }
    }

    public function show(User $user) {
        //
    }

    public function edit(User $user) {
        return Inertia::render('admins/users/edit', [
            'user' => new UserResource($user),
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    public function update(UpdateUserRequest $request, User $user) {
        try {
            $validated = $request->validated();

            $user->update($validated);

            return redirect()->route('users.index')->with('success', 'User updated successfully.');
        } catch (\Exception $e) {
            Log::error($e->getMessage());

            return redirect()->back()->with('error', 'Failed to update user.');
        }
    }

    public function destroy(User $user) {
        try {
            $user->delete();

            return redirect()->back()->with('success', 'User deleted successfully.');
        } catch (\Exception $e) {
            Log::error($e->getMessage());

            return redirect()->back()->with('error', 'Failed to delete user.');
        }
    }
}
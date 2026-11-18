<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Show the registration page.
     */
    public function create(): Response
    {
        return Inertia::render('auth/register');
    }

    /**
     * Handle an incoming registration request.
     *
     * PPL-01: pengguna mendaftar dengan username + password.
     * Email bersifat opsional (boleh dikosongkan).
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->merge([
            'username' => trim((string) $request->input('username')),
            'email' => $request->filled('email')
                ? mb_strtolower(trim((string) $request->input('email')))
                : null,
        ]);

        $validated = $request->validate([
            'username' => [
                'required',
                'string',
                'min:3',
                'max:25',
                'regex:/^[A-Za-z0-9._]+$/',
                'unique:' . User::class . ',username',
            ],
            'email' => [
                'nullable',
                'string',
                'lowercase',
                'email',
                'max:40',
                'unique:' . User::class . ',email',
            ],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ], [
            'username.regex'  => 'Username hanya boleh berisi huruf, angka, titik, dan garis bawah.',
            'username.unique' => 'Username sudah dipakai, pilih yang lain.',
            'username.max'    => 'Username maksimal 25 karakter.',
            'email.unique'    => 'Email sudah terdaftar.',
        ]);

        $user = User::create([
            'username' => $validated['username'],
            'email' => $validated['email'] ?? null,
            'password' => Hash::make($validated['password']),
            'role' => 'CLIENT',
            'status' => 'active',
        ]);

        event(new Registered($user));

        Auth::login($user);

        return to_route('Homepage');
    }
}

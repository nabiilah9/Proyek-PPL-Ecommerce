<?php

use App\Models\User;

test('registration screen can be rendered', function () {
    $response = $this->get('/register');

    $response->assertStatus(200);
});

test('new users can register', function () {
    $response = $this->post('/register', [
        'username' => 'testuser',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $this->assertAuthenticated();

    $response->assertRedirect(route('Homepage', absolute: false));
});

// PPL-01: registrasi cukup username + password, email opsional.
test('users can register without an email address', function () {
    $this->post('/register', [
        'username' => 'tanpaemail',
        'password' => 'password',
        'password_confirmation' => 'password',
    ])->assertRedirect(route('Homepage', absolute: false));

    $this->assertAuthenticated();

    $user = User::where('username', 'tanpaemail')->firstOrFail();

    expect($user->email)->toBeNull();
    expect($user->role)->toBe('CLIENT');
    expect($user->status)->toBe('active');
});

test('role cannot be escalated through the registration form', function () {
    $this->post('/register', [
        'username' => 'penyusup',
        'password' => 'password',
        'password_confirmation' => 'password',
        'role' => 'ADMIN',
    ])->assertRedirect(route('Homepage', absolute: false));

    expect(User::where('username', 'penyusup')->firstOrFail()->role)->toBe('CLIENT');
});

test('username must be unique', function () {
    User::factory()->create(['username' => 'bentrok']);

    $this->post('/register', [
        'username' => 'bentrok',
        'password' => 'password',
        'password_confirmation' => 'password',
    ])->assertSessionHasErrors('username');

    $this->assertGuest();
});

test('username rejects characters outside letters digits dot underscore', function () {
    $this->post('/register', [
        'username' => 'nama saya',
        'password' => 'password',
        'password_confirmation' => 'password',
    ])->assertSessionHasErrors('username');

    $this->assertGuest();
});

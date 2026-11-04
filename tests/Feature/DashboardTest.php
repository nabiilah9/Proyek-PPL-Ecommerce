<?php

use App\Models\User;

test('guests are redirected to the login page', function () {
    $this->get(route('dashboard', absolute: false))
        ->assertRedirect('/login');
});

test('authenticated users can visit the dashboard', function () {
    $this->actingAs($user = User::factory()->admin()->create());

    $this->get(route('dashboard', absolute: false))
        ->assertOk();
});
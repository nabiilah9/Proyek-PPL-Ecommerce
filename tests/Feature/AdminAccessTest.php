<?php

use App\Models\User;

/**
 * B-2: area admin hanya untuk role ADMIN.
 */
test('guests cannot reach admin area', function () {
    $this->get('/admin')->assertRedirect('/login');
});

test('client is forbidden from admin dashboard', function () {
    $client = User::factory()->client()->create();

    $this->actingAs($client)->get('/admin')->assertForbidden();
});

test('courier is forbidden from admin dashboard', function () {
    $courier = User::factory()->courier()->create();

    $this->actingAs($courier)->get('/admin')->assertForbidden();
});

test('admin can reach admin dashboard', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->get('/admin')->assertOk();
});

test('client is forbidden from admin user management', function () {
    $client = User::factory()->client()->create();

    $this->actingAs($client)->get('/admin/users')->assertForbidden();
});

test('client is forbidden from admin transaction management', function () {
    $client = User::factory()->client()->create();

    $this->actingAs($client)->get('/admin/transactions')->assertForbidden();
});

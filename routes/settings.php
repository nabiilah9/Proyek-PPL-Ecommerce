<?php

use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController; // Note: This is a different ProfileController than your Client one!
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('auth')->group(function () {
    Route::redirect('settings', 'settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('settings.profile.edit'); // Changed name
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('settings.profile.update'); // Changed name
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('settings.profile.destroy'); // Changed name

    Route::get('settings/password', [PasswordController::class, 'edit'])->name('password.edit');
    Route::put('settings/password', [PasswordController::class, 'update'])->name('password.update');

    Route::get('settings/appearance', function () {
        return Inertia::render('admins/settings/appearance');
    })->name('appearance');
});
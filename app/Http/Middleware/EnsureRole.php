<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Membatasi akses berdasarkan kolom users.role.
 *
 * Pemakaian: ->middleware('role:ADMIN') atau ->middleware('role:ADMIN,COURIER')
 */
class EnsureRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            abort(401);
        }

        $role = strtoupper((string) $user->role);
        $allowed = array_map('strtoupper', $roles);

        if (!in_array($role, $allowed, true)) {
            abort(403, 'Anda tidak punya akses ke halaman ini.');
        }

        if (isset($user->status) && $user->status === 'inactive') {
            abort(403, 'Akun Anda sedang tidak aktif.');
        }

        return $next($request);
    }
}

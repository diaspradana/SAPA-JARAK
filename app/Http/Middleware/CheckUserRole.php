<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckUserRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak: Autentikasi diperlukan. Sertakan Authorization Bearer Token yang sah.',
            ], 401);
        }

        if (!in_array($user->role, $roles) && $user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => "Akses ditolak: Peran akun '{$user->role}' tidak memiliki izin untuk mengakses sumber daya ini.",
                'required_roles' => $roles,
            ], 403);
        }

        return $next($request);
    }
}

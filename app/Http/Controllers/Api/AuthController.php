<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Formal authentication endpoint (Sanctum Token Issuance).
     */
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
            'device_name' => 'nullable|string',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Kombinasi email dan kata sandi tidak cocok.',
                'errors' => [
                    'email' => ['Kredensial yang Anda masukkan salah.']
                ]
            ], 401);
        }

        if ($user->status && $user->status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'Akun aparatur desa telah dinonaktifkan oleh administrator.',
            ], 403);
        }

        $deviceName = $validated['device_name'] ?? 'sapa-jarak-client';
        $token = $user->createToken($deviceName, ["role:{$user->role}", "*"])->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => "Autentikasi berhasil. Selamat datang, {$user->name}.",
            'data' => [
                'token_type' => 'Bearer',
                'access_token' => $token,
                'user' => $user->load('hamlet'),
            ],
        ], 200);
    }

    /**
     * Get authenticated user profile.
     */
    public function me(Request $request)
    {
        return response()->json([
            'success' => true,
            'data' => $request->user()->load('hamlet'),
        ]);
    }

    /**
     * Revoke current access token (Logout).
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Sesi autentikasi berhasil diakhiri (logout berhasil).',
        ]);
    }

    /**
     * Get list of demo users for interactive role switching.
     */
    public function users()
    {
        return response()->json([
            'success' => true,
            'data' => User::with('hamlet')->get(),
        ]);
    }

    /**
     * Switch current user session/role (with Sanctum token issuance for demo).
     */
    public function switchRole(Request $request)
    {
        $role = $request->input('role');
        $user = User::where('role', $role)->first();

        if (!$user) {
            $user = User::first();
        }

        $token = $user->createToken('demo-switch-token', ["role:{$user->role}", "*"])->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => "Beralih ke peran {$user->name} ({$user->role})",
            'data' => [
                'token_type' => 'Bearer',
                'access_token' => $token,
                'user' => $user->load('hamlet'),
            ],
        ]);
    }
}

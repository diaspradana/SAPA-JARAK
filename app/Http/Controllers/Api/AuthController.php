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
     * Pendaftaran akun warga masyarakat baru (Register Citizen).
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:30|unique:users,phone',
            'email' => 'nullable|email|max:255|unique:users,email',
            'password' => 'required|string|min:6',
            'hamlet_id' => 'nullable|exists:hamlets,id',
            'nik' => 'nullable|string|max:20',
            'kk_number' => 'nullable|string|max:20',
            'rt' => 'nullable|string|max:5',
            'rw' => 'nullable|string|max:5',
        ]);

        $email = $validated['email'] ?? null;
        if (!$email) {
            $sanitizedPhone = preg_replace('/[^0-9]/', '', $validated['phone']);
            $email = "warga.{$sanitizedPhone}@jarak-kediri.desa.id";
        }

        $user = User::create([
            'name' => $validated['name'],
            'email' => $email,
            'phone' => $validated['phone'],
            'password' => Hash::make($validated['password']),
            'role' => 'public',
            'hamlet_id' => $validated['hamlet_id'] ?? null,
            'status' => 'active',
        ]);

        $deviceName = $request->input('device_name', 'sapa-jarak-citizen-app');
        $token = $user->createToken($deviceName, ["role:public", "*"])->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => "Pendaftaran berhasil! Selamat datang, {$user->name}.",
            'data' => [
                'token_type' => 'Bearer',
                'access_token' => $token,
                'user' => $user->load('hamlet'),
            ],
        ], 201);
    }

    /**
     * Formal authentication endpoint (Sanctum Token Issuance) with email or phone.
     */
    public function login(Request $request)
    {
        $validated = $request->validate([
            'login' => 'nullable|string',
            'email' => 'nullable|string',
            'password' => 'required|string',
            'device_name' => 'nullable|string',
        ]);

        $loginIdentifier = $validated['login'] ?? $validated['email'] ?? '';

        $user = User::where('email', $loginIdentifier)
            ->orWhere('phone', $loginIdentifier)
            ->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Kombinasi email/no HP dan kata sandi tidak cocok.',
                'errors' => [
                    'login' => ['Kredensial yang Anda masukkan salah.']
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

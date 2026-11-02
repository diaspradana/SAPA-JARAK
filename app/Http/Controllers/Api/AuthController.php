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
     * Pendaftaran akun warga masyarakat baru atau registrasi petugas desa resmi.
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:30|unique:users,phone',
            'email' => 'nullable|email|max:255|unique:users,email',
            'password' => 'required|string|min:6',
            'account_type' => 'nullable|string|in:warga,petugas_desa',
            'role' => 'nullable|string',
            'position' => 'nullable|string|max:100',
            'nip' => 'nullable|string|max:50',
            'auth_code' => 'nullable|string|max:50',
            'hamlet_id' => 'nullable|exists:hamlets,id',
            'nik' => 'nullable|string|max:20|unique:users,nik',
            'kk_number' => 'nullable|string|max:20',
            'rt' => 'nullable|string|max:5',
            'rw' => 'nullable|string|max:5',
            'address' => 'nullable|string|max:255',
        ]);

        $accountType = $validated['account_type'] ?? 'warga';
        $role = 'public';

        if ($accountType === 'petugas_desa') {
            $inputCode = strtoupper(trim($validated['auth_code'] ?? ''));
            $validCode = in_array($inputCode, ['DESAJARAK2026', 'JARAK2026']);
            if (!$validCode) {
                return response()->json([
                    'success' => false,
                    'message' => 'Kode Otorisasi Aparatur Desa tidak valid. Gunakan kode resmi Balai Desa: DESAJARAK2026.',
                    'errors' => ['auth_code' => ['Kode otorisasi tidak sesuai.']]
                ], 422);
            }

            // Determine role based on requested role or position
            $reqRole = strtolower($validated['role'] ?? '');
            $position = strtolower($validated['position'] ?? '');
            if (in_array($reqRole, ['admin', 'kades', 'sekdes', 'kasi_kesra'])) {
                $role = $reqRole;
            } elseif (str_contains($position, 'kades') || str_contains($position, 'kepala desa')) {
                $role = 'kades';
            } elseif (str_contains($position, 'sekdes') || str_contains($position, 'sekretaris')) {
                $role = 'sekdes';
            } elseif (str_contains($position, 'admin')) {
                $role = 'admin';
            } else {
                $role = 'kasi_kesra';
            }
        }

        $email = $validated['email'] ?? null;
        if (!$email) {
            $sanitizedPhone = preg_replace('/[^0-9]/', '', $validated['phone']);
            $prefix = $accountType === 'petugas_desa' ? 'petugas' : 'warga';
            $email = "{$prefix}.{$sanitizedPhone}@jarak-kediri.desa.id";
        }

        $user = User::create([
            'name' => $validated['name'],
            'email' => $email,
            'phone' => $validated['phone'],
            'password' => Hash::make($validated['password']),
            'role' => $role,
            'hamlet_id' => $validated['hamlet_id'] ?? null,
            'status' => 'active',
            'nik' => $validated['nik'] ?? null,
            'kk_number' => $validated['kk_number'] ?? null,
            'rt' => $validated['rt'] ?? null,
            'rw' => $validated['rw'] ?? null,
            'address' => $validated['address'] ?? null,
        ]);

        $deviceName = $request->input('device_name', $accountType === 'petugas_desa' ? 'sapa-jarak-officer' : 'sapa-jarak-citizen');
        $token = $user->createToken($deviceName, ["role:{$role}", "*"])->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => $accountType === 'petugas_desa' 
                ? "Registrasi Petugas Desa berhasil! Selamat datang, {$user->name}." 
                : "Pendaftaran berhasil! Selamat datang, {$user->name}.",
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

        $loginIdentifier = trim($validated['login'] ?? $validated['email'] ?? '');
        $sanitizedPhone = preg_replace('/[^0-9]/', '', $loginIdentifier);

        $user = User::where('email', $loginIdentifier)
            ->orWhere('phone', $loginIdentifier)
            ->when(!empty($sanitizedPhone), function ($query) use ($sanitizedPhone) {
                return $query->orWhere('phone', $sanitizedPhone);
            })
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

    public function updatePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:6|confirmed',
        ]);

        $user = $request->user();
        if (!Hash::check($validated['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Kata sandi lama tidak sesuai.'],
            ]);
        }

        $user->password = Hash::make($validated['new_password']);
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Kata sandi berhasil diperbarui di server.',
        ]);
    }

    public function demoAccounts()
    {
        if (!app()->environment(['local', 'testing'])) {
            return response()->json(['success' => true, 'data' => []]);
        }

        return response()->json([
            'success' => true,
            'data' => User::with('hamlet')
                ->whereIn('phone', [
                    '081234567000',
                    '081234567001',
                    '081234567002',
                    '081234567003',
                    '081234567801',
                    '081234567802',
                    '081234567803',
                    '081234567804',
                    '081234567805',
                    '081399881234',
                ])
                ->where('status', 'active')
                ->orderBy('role')
                ->get()
                ->map(fn (User $user) => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'role' => $user->role,
                    'position' => [
                        'kades' => 'Kepala Desa',
                        'sekdes' => 'Sekretaris Desa',
                        'kasi_kesra' => 'Petugas Verifikasi',
                        'admin' => 'Administrator Sistem',
                        'kasun' => 'Kepala Dusun',
                        'public' => 'Warga / Pelapor',
                    ][$user->role] ?? 'Petugas Desa',
                    'role_label' => $user->role === 'kasun'
                        ? "Kasun {$user->hamlet?->name}"
                        : ([
                            'kades' => 'Kepala Desa',
                            'sekdes' => 'Sekretaris Desa',
                            'kasi_kesra' => 'Petugas Verifikasi',
                            'admin' => 'Administrator Sistem',
                            'public' => 'Warga / Pelapor',
                        ][$user->role] ?? 'Petugas Desa'),
                    'hamlet_name' => $user->hamlet?->name,
                    'avatar_initials' => collect(explode(' ', $user->name))
                        ->filter()
                        ->take(2)
                        ->map(fn (string $part) => mb_strtoupper(mb_substr($part, 0, 1)))
                        ->implode(''),
                ]),
        ]);
    }
}

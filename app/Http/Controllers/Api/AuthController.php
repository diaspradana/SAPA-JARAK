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
     * Public registration is limited to warga and invited village administrators.
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:30|unique:users,phone',
            'email' => 'nullable|email|max:255|unique:users,email',
            'password' => 'required|string|min:6',
            'account_type' => 'nullable|string|in:warga,admin_desa',
            'auth_code' => 'required_if:account_type,admin_desa|string|max:100',
            'hamlet_id' => 'nullable|exists:hamlets,id',
            'nik' => 'required_unless:account_type,admin_desa|nullable|string|digits:16|unique:users,nik',
            'kk_number' => 'required_unless:account_type,admin_desa|nullable|string|digits:16',
            'rt' => 'required_unless:account_type,admin_desa|nullable|string|max:5',
            'rw' => 'required_unless:account_type,admin_desa|nullable|string|max:5',
            'address' => 'required_unless:account_type,admin_desa|nullable|string|max:255',
        ]);

        $accountType = $validated['account_type'] ?? 'warga';
        $role = 'public';

        if ($accountType === 'admin_desa') {
            $inputCode = strtoupper(trim($validated['auth_code'] ?? ''));
            $registrationCode = (string) config('services.admin_registration_code');
            if ($registrationCode === '' || !hash_equals(strtoupper($registrationCode), $inputCode)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Kode undangan administrator desa tidak valid atau belum dikonfigurasi.',
                    'errors' => ['auth_code' => ['Kode otorisasi tidak sesuai.']]
                ], 403);
            }
            $role = 'admin';
        }

        $email = $validated['email'] ?? null;
        if (!$email) {
            $sanitizedPhone = preg_replace('/[^0-9]/', '', $validated['phone']);
            $prefix = $accountType === 'admin_desa' ? 'admin' : 'warga';
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

        $deviceName = $request->input('device_name', $accountType === 'admin_desa' ? 'sapa-jarak-admin' : 'sapa-jarak-citizen');
        $token = $user->createToken($deviceName, ["role:{$role}", "*"])->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => $accountType === 'admin_desa'
                ? "Registrasi administrator desa berhasil! Selamat datang, {$user->name}."
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

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Hamlet;
use App\Models\Setting;
use App\Models\AuditLog;
use App\Models\Application;
use App\Models\Document;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Carbon\Carbon;

class AdminController extends Controller
{
    /**
     * Admin Overview: system stats, apparatus metrics, storage, and configuration summary.
     */
    public function overview()
    {
        $userStats = [
            'total' => User::count(),
            'active' => User::where('status', 'active')->count(),
            'inactive' => User::where('status', 'inactive')->count(),
            'by_role' => [
                'admin' => User::where('role', 'admin')->count(),
                'kades' => User::where('role', 'kades')->count(),
                'sekdes' => User::where('role', 'sekdes')->count(),
                'kasi_kesra' => User::where('role', 'kasi_kesra')->count(),
                'kasun' => User::where('role', 'kasun')->count(),
                'public' => User::where('role', 'public')->count(),
            ],
        ];

        $hamletStats = [
            'total' => Hamlet::count(),
            'active' => Hamlet::where('status', 'active')->count(),
        ];

        $appStats = [
            'total' => Application::count(),
            'submitted' => Application::where('status', 'SUBMITTED')->count(),
            'approved' => Application::whereIn('status', ['APPROVED', 'FUNDING_ALLOCATED', 'PROCUREMENT_IN_PROGRESS', 'READY_FOR_HANDOVER'])->count(),
            'completed' => Application::where('status', 'COMPLETED')->count(),
            'rejected' => Application::where('status', 'REJECTED')->count(),
        ];

        $auditStats = [
            'total' => AuditLog::count(),
            'today' => AuditLog::whereDate('created_at', Carbon::today())->count(),
        ];

        $storageStats = [
            'total_files' => Document::count(),
            'total_bytes' => (int) Document::sum('file_size'),
        ];

        $villageProfile = Setting::getGroup('village');
        $scoringSettings = Setting::getGroup('scoring');

        return response()->json([
            'success' => true,
            'data' => [
                'users' => $userStats,
                'hamlets' => $hamletStats,
                'applications' => $appStats,
                'audit_logs' => $auditStats,
                'storage' => $storageStats,
                'village_profile' => $villageProfile,
                'scoring' => $scoringSettings,
            ],
        ]);
    }

    // -------------------------------------------------------------------------
    // 1. MANAJEMEN APARATUR DESA (USER MANAGEMENT)
    // -------------------------------------------------------------------------

    /**
     * List all apparatus users with filtering, searching, and pagination.
     */
    public function users(Request $request)
    {
        $query = User::with('hamlet:id,name,code,head_name');

        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        if ($request->filled('hamlet_id')) {
            $query->where('hamlet_id', $request->hamlet_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $query->orderBy('role')->orderBy('name');

        if ($request->boolean('all')) {
            $users = $query->get();
            return response()->json([
                'success' => true,
                'data' => $users,
                'total' => $users->count(),
            ]);
        }

        $perPage = min(100, max(5, (int) $request->get('per_page', 15)));
        $users = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $users->items(),
            'pagination' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
            ],
        ]);
    }

    /**
     * Show single apparatus user details.
     */
    public function showUser(int $id)
    {
        $user = User::with('hamlet')->withCount(['verifications', 'auditLogs'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $user,
        ]);
    }

    /**
     * Create a new apparatus user account.
     */
    public function createUser(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'phone' => 'required|string|max:30|unique:users,phone',
            'password' => 'required|string|min:6',
            'role' => 'required|in:admin,kades,sekdes,kasi_kesra,kasun,public',
            'hamlet_id' => [
                'nullable',
                'exists:hamlets,id',
                Rule::requiredIf(fn () => $request->role === 'kasun'),
            ],
            'status' => 'nullable|in:active,inactive',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'hamlet_id' => $validated['hamlet_id'] ?? null,
            'status' => $validated['status'] ?? 'active',
        ]);

        // Auto update hamlet head info if role is kasun
        if ($user->role === 'kasun' && $user->hamlet_id) {
            $hamlet = Hamlet::find($user->hamlet_id);
            if ($hamlet && empty($hamlet->head_name)) {
                $hamlet->update([
                    'head_name' => $user->name,
                    'head_phone' => $user->phone,
                ]);
            }
        }

        // Record audit log
        $actor = Auth::user();
        AuditLog::create([
            'user_id' => $actor?->id,
            'actor_name' => $actor?->name ?? 'Administrator',
            'action' => 'USER_CREATED',
            'entity_type' => User::class,
            'entity_id' => $user->id,
            'new_values' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
                'hamlet_id' => $user->hamlet_id,
                'status' => $user->status,
            ],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'message' => "Akun aparatur desa '{$user->name}' ({$user->role}) berhasil ditambahkan.",
            'data' => $user->load('hamlet'),
        ], 201);
    }

    /**
     * Update an apparatus user account.
     */
    public function updateUser(Request $request, int $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => ['sometimes', 'required', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'phone' => ['sometimes', 'required', 'string', 'max:30', Rule::unique('users')->ignore($user->id)],
            'password' => 'nullable|string|min:6',
            'role' => 'sometimes|required|in:admin,kades,sekdes,kasi_kesra,kasun,public',
            'hamlet_id' => 'nullable|exists:hamlets,id',
            'status' => 'sometimes|required|in:active,inactive',
        ]);

        $oldValues = [
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'role' => $user->role,
            'hamlet_id' => $user->hamlet_id,
            'status' => $user->status,
        ];

        if (!empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }
        unset($validated['password']);

        $user->fill($validated);
        $user->save();

        $newValues = [
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'role' => $user->role,
            'hamlet_id' => $user->hamlet_id,
            'status' => $user->status,
        ];

        // Record audit log
        $actor = Auth::user();
        AuditLog::create([
            'user_id' => $actor?->id,
            'actor_name' => $actor?->name ?? 'Administrator',
            'action' => 'USER_UPDATED',
            'entity_type' => User::class,
            'entity_id' => $user->id,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'message' => "Data aparatur '{$user->name}' berhasil diperbarui.",
            'data' => $user->load('hamlet'),
        ]);
    }

    /**
     * Delete an apparatus user account.
     */
    public function deleteUser(Request $request, int $id)
    {
        $user = User::findOrFail($id);
        $actor = Auth::user();

        // Prevent self deletion
        if ($actor && $actor->id === $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Tindakan ditolak: Anda tidak dapat menghapus akun administrator yang sedang digunakan saat ini.',
            ], 422);
        }

        $oldValues = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'hamlet_id' => $user->hamlet_id,
        ];

        $user->delete();

        AuditLog::create([
            'user_id' => $actor?->id,
            'actor_name' => $actor?->name ?? 'Administrator',
            'action' => 'USER_DELETED',
            'entity_type' => User::class,
            'entity_id' => $id,
            'old_values' => $oldValues,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'message' => "Akun aparatur '{$oldValues['name']}' berhasil dihapus dari sistem.",
        ]);
    }

    // -------------------------------------------------------------------------
    // 2. MANAJEMEN WILAYAH DUSUN (HAMLET MANAGEMENT)
    // -------------------------------------------------------------------------

    /**
     * List all hamlets with associated counts and kasun details.
     */
    public function hamlets()
    {
        $hamlets = Hamlet::withCount(['applications', 'beneficiaries', 'users'])->get();

        return response()->json([
            'success' => true,
            'data' => $hamlets,
        ]);
    }

    /**
     * Show single hamlet details.
     */
    public function showHamlet(int $id)
    {
        $hamlet = Hamlet::with(['users:id,name,role,phone,email,status'])->withCount(['applications', 'beneficiaries'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $hamlet,
        ]);
    }

    /**
     * Create a new hamlet.
     */
    public function createHamlet(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'code' => 'required|string|max:10|unique:hamlets,code',
            'head_name' => 'nullable|string|max:100',
            'head_phone' => 'nullable|string|max:30',
            'status' => 'nullable|in:active,inactive',
        ]);

        $hamlet = Hamlet::create([
            'name' => $validated['name'],
            'code' => strtoupper($validated['code']),
            'head_name' => $validated['head_name'] ?? null,
            'head_phone' => $validated['head_phone'] ?? null,
            'status' => $validated['status'] ?? 'active',
        ]);

        $actor = Auth::user();
        AuditLog::create([
            'user_id' => $actor?->id,
            'actor_name' => $actor?->name ?? 'Administrator',
            'action' => 'HAMLET_CREATED',
            'entity_type' => Hamlet::class,
            'entity_id' => $hamlet->id,
            'new_values' => $hamlet->toArray(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'message' => "Wilayah dusun '{$hamlet->name}' ({$hamlet->code}) berhasil ditambahkan.",
            'data' => $hamlet,
        ], 201);
    }

    /**
     * Update hamlet details.
     */
    public function updateHamlet(Request $request, int $id)
    {
        $hamlet = Hamlet::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:100',
            'code' => ['sometimes', 'required', 'string', 'max:10', Rule::unique('hamlets')->ignore($hamlet->id)],
            'head_name' => 'nullable|string|max:100',
            'head_phone' => 'nullable|string|max:30',
            'status' => 'sometimes|required|in:active,inactive',
        ]);

        $oldValues = $hamlet->only(['name', 'code', 'head_name', 'head_phone', 'status']);

        if (isset($validated['code'])) {
            $validated['code'] = strtoupper($validated['code']);
        }

        $hamlet->update($validated);

        $actor = Auth::user();
        AuditLog::create([
            'user_id' => $actor?->id,
            'actor_name' => $actor?->name ?? 'Administrator',
            'action' => 'HAMLET_UPDATED',
            'entity_type' => Hamlet::class,
            'entity_id' => $hamlet->id,
            'old_values' => $oldValues,
            'new_values' => $hamlet->only(['name', 'code', 'head_name', 'head_phone', 'status']),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'message' => "Data dusun '{$hamlet->name}' berhasil diperbarui.",
            'data' => $hamlet,
        ]);
    }

    /**
     * Delete hamlet (safely blocked if related records exist).
     */
    public function deleteHamlet(Request $request, int $id)
    {
        $hamlet = Hamlet::withCount(['applications', 'beneficiaries', 'users'])->findOrFail($id);

        if ($hamlet->applications_count > 0 || $hamlet->beneficiaries_count > 0) {
            return response()->json([
                'success' => false,
                'message' => "Dusun '{$hamlet->name}' tidak dapat dihapus karena masih terkait dengan {$hamlet->applications_count} berkas pengajuan atau {$hamlet->beneficiaries_count} warga penerima. Ubah status menjadi 'inactive' jika wilayah ini dinonaktifkan.",
            ], 422);
        }

        $oldValues = $hamlet->toArray();
        $hamlet->delete();

        $actor = Auth::user();
        AuditLog::create([
            'user_id' => $actor?->id,
            'actor_name' => $actor?->name ?? 'Administrator',
            'action' => 'HAMLET_DELETED',
            'entity_type' => Hamlet::class,
            'entity_id' => $id,
            'old_values' => $oldValues,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'message' => "Wilayah dusun '{$oldValues['name']}' berhasil dihapus.",
        ]);
    }

    // -------------------------------------------------------------------------
    // 3. PENGATURAN SISTEM & PARAMETER SCORING (SETTINGS)
    // -------------------------------------------------------------------------

    /**
     * Get all settings grouped by category.
     */
    public function settings(Request $request)
    {
        $group = $request->query('group');

        if ($group) {
            $settings = Setting::getGroup($group);
            return response()->json([
                'success' => true,
                'group' => $group,
                'data' => $settings,
            ]);
        }

        $allGrouped = Setting::getAllGrouped();
        $rawSettings = Setting::all();

        return response()->json([
            'success' => true,
            'grouped' => $allGrouped,
            'raw' => $rawSettings,
        ]);
    }

    /**
     * Batch update settings.
     */
    public function updateSettings(Request $request)
    {
        $payload = $request->input('settings', $request->all());

        if (!is_array($payload) || empty($payload)) {
            return response()->json([
                'success' => false,
                'message' => 'Format payload pengaturan tidak valid. Kirimkan pasangan key-value konfigurasi.',
            ], 422);
        }

        $oldValues = [];
        $newValues = [];

        foreach ($payload as $key => $value) {
            // Skip non-string or reserved keys if passed at top level
            if (!is_string($key) || in_array($key, ['_token', '_method'])) {
                continue;
            }

            $currentSetting = Setting::where('key', $key)->first();
            $oldValues[$key] = $currentSetting ? Setting::get($key) : null;

            // Auto-group based on prefix e.g. village.*, scoring.*, notification.*
            $prefix = explode('.', $key)[0] ?? 'general';

            Setting::set($key, $value, $currentSetting?->group ?? $prefix);
            $newValues[$key] = Setting::get($key);
        }

        // Record audit log
        $actor = Auth::user();
        AuditLog::create([
            'user_id' => $actor?->id,
            'actor_name' => $actor?->name ?? 'Administrator',
            'action' => 'SETTINGS_UPDATED',
            'entity_type' => Setting::class,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Konfigurasi pengaturan administrasi dan scoring berhasil diperbarui.',
            'data' => Setting::getAllGrouped(),
        ]);
    }

    /**
     * Get single setting by key.
     */
    public function getSettingByKey(string $key)
    {
        $setting = Setting::where('key', $key)->first();

        if (!$setting) {
            return response()->json([
                'success' => false,
                'message' => "Pengaturan dengan kunci '{$key}' tidak ditemukan.",
            ], 404);
        }

        return response()->json([
            'success' => true,
            'key' => $key,
            'value' => Setting::get($key),
            'setting' => $setting,
        ]);
    }

    /**
     * Update single setting by key.
     */
    public function updateSettingByKey(Request $request, string $key)
    {
        $validated = $request->validate([
            'value' => 'required',
        ]);

        $oldValue = Setting::get($key);
        $setting = Setting::set($key, $validated['value']);

        $actor = Auth::user();
        AuditLog::create([
            'user_id' => $actor?->id,
            'actor_name' => $actor?->name ?? 'Administrator',
            'action' => 'SETTING_UPDATED',
            'entity_type' => Setting::class,
            'old_values' => [$key => $oldValue],
            'new_values' => [$key => Setting::get($key)],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'message' => "Pengaturan '{$key}' berhasil diperbarui.",
            'key' => $key,
            'value' => Setting::get($key),
        ]);
    }

    // -------------------------------------------------------------------------
    // 4. PENGAWASAN LOG JEJAK AUDIT (AUDIT LOG VIEWER - FR-020)
    // -------------------------------------------------------------------------

    /**
     * List audit logs with comprehensive filters and statistics.
     */
    public function auditLogs(Request $request)
    {
        $query = AuditLog::with([
            'user:id,name,role,email',
            'application:id,ticket,status,assistance_type,beneficiary_id',
            'application.beneficiary:id,name',
        ]);

        if ($request->filled('action')) {
            $query->where('action', $request->action);
        }

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->filled('actor_name')) {
            $query->where('actor_name', 'like', "%{$request->actor_name}%");
        }

        if ($request->filled('entity_type')) {
            $query->where('entity_type', 'like', "%{$request->entity_type}%");
        }

        if ($request->filled('date_from')) {
            $query->where('created_at', '>=', Carbon::parse($request->date_from)->startOfDay());
        }

        if ($request->filled('date_to')) {
            $query->where('created_at', '<=', Carbon::parse($request->date_to)->endOfDay());
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('action', 'like', "%{$search}%")
                  ->orWhere('actor_name', 'like', "%{$search}%")
                  ->orWhere('entity_type', 'like', "%{$search}%")
                  ->orWhere('ip_address', 'like', "%{$search}%");
            });
        }

        $query->latest('id');

        $perPage = min(100, max(5, (int) $request->get('per_page', 20)));
        $logs = $query->paginate($perPage);

        // Stats summary for the dashboard
        $stats = [
            'total_logs' => AuditLog::count(),
            'today_logs' => AuditLog::whereDate('created_at', Carbon::today())->count(),
            'top_actions' => AuditLog::selectRaw('action, count(*) as count')
                ->groupBy('action')
                ->orderByDesc('count')
                ->limit(5)
                ->get(),
        ];

        return response()->json([
            'success' => true,
            'stats' => $stats,
            'data' => $logs->items(),
            'pagination' => [
                'current_page' => $logs->currentPage(),
                'last_page' => $logs->lastPage(),
                'per_page' => $logs->perPage(),
                'total' => $logs->total(),
            ],
        ]);
    }

    /**
     * Show single audit log detail with full diffs.
     */
    public function showAuditLog(int $id)
    {
        $log = AuditLog::with([
            'user:id,name,role,email',
            'application:id,ticket,status,assistance_type,beneficiary_id',
            'application.beneficiary:id,name',
        ])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $log,
        ]);
    }
}

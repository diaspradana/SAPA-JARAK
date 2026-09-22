<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
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
     * Switch current user session/role.
     */
    public function switchRole(Request $request)
    {
        $role = $request->input('role');
        $user = User::where('role', $role)->first();

        if (!$user) {
            $user = User::first();
        }

        return response()->json([
            'success' => true,
            'message' => "Beralih ke peran {$user->name} ({$user->role})",
            'data' => $user,
        ]);
    }
}

<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        // Attempt to find user
        $user = User::where('email', $request->email)->first();

        // If not found, and it's an Evi demo login, we can auto-create the user for convenience
        // In a real app, they would register first. But the frontend demo uses "Evi" loosely.
        if (!$user && str_contains(strtolower($request->email), 'evi')) {
            $user = User::create([
                'name' => 'Evi Nirmalasari',
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => 'student',
                'class' => 'XII IPA 1',
                'avatar' => 'EN',
            ]);
        }

        if (!$user || !Hash::check($request->password, $user->password)) {
            // For demo purposes, we will bypass password check if it's the "evi" demo
            if ($user && str_contains(strtolower($user->email), 'evi')) {
                // allow
            } else {
                throw ValidationException::withMessages([
                    'email' => ['Kredensial tidak valid.'],
                ]);
            }
        }

        // Issue token
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => [
                'id' => (string) $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'class' => $user->class,
                'subject' => $user->subject,
                'avatar' => $user->avatar,
            ],
            'token' => $token,
        ]);
    }

    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|in:student,teacher',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'class' => $request->class ?? null,
            'subject' => $request->subject ?? null,
            'avatar' => strtoupper(substr(preg_replace('/\s+/', '', $request->name), 0, 2)),
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => [
                'id' => (string) $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'class' => $user->class,
                'subject' => $user->subject,
                'avatar' => $user->avatar,
            ],
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }
}

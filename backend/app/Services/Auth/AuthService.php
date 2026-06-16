<?php

namespace App\Services\Auth;

use App\DTOs\Auth\LoginData;
use App\DTOs\Auth\RegisterData;
use App\Repositories\UserRepository;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use App\Models\Mongo\ActivityLog;

class AuthService
{
    public function __construct(
        private UserRepository $users
    ) {}

    public function register(RegisterData $data): array
    {
        $user = $this->users->create($data);

        $token = auth('api')->login($user);

        return [
            'token' => $token,
        ];
    }

    public function login(
        LoginData $data,
        Request $request
    ): array {

        if (!$token = Auth::guard('api')->attempt([
            'email' => $data->email,
            'password' => $data->password,
        ])) {
            abort(401, 'Unauthorized');
        }

        $user = Auth::guard('api')->user();

        Cache::put(
            "user-is-online-{$user->id}",
            true,
            now()->addMinutes(5)
        );

        ActivityLog::create([
            'user_id' => $user->id,
            'type' => 'auth',
            'action' => 'login',
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => now(),
        ]);

        return [
            'token' => $token,
            'token_type' => 'bearer',
            'expires_in' => auth('api')
                ->factory()
                ->getTTL() * 60,
        ];
    }

    public function logout(): array
    {
        $user = auth('api')->user();

        ActivityLog::create([
            'user_id' => $user->id,
            'type' => 'auth',
            'action' => 'logout',
            'created_at' => now(),
        ]);

        Cache::forget(
            "user-is-online-{$user->id}"
        );

        auth('api')->logout();

        return [
            'message' => 'Successfully logged out',
        ];
    }

    public function refresh(): array
    {
        return [
            'token' => auth('api')->refresh(),
            'token_type' => 'bearer',
            'expires_in' => auth('api')
                ->factory()
                ->getTTL() * 60,
        ];
    }

    public function me(): array
    {
        $user = auth()->user();

        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
        ];
    }
}

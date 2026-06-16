<?php

namespace App\Repositories;

use Illuminate\Support\Facades\DB;

class PasswordResetRepository
{
    public function createToken(
        string $email,
        string $token
    ): void {

        DB::table('password_resets')
            ->updateOrInsert(
                ['email' => $email],
                [
                    'token' => $token,
                    'created_at' => now(),
                ]
            );
    }

    public function findToken(
        string $email,
        string $token
    ) {
        return DB::table('password_resets')
            ->where('email', $email)
            ->where('token', $token)
            ->first();
    }

    public function deleteToken(
        string $email
    ): void {
        DB::table('password_resets')
            ->where('email', $email)
            ->delete();
    }
}

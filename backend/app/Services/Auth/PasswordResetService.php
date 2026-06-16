<?php

namespace App\Services\Auth;

use App\DTOs\Auth\ResetPasswordData;
use App\Models\User;
use App\Notifications\ResetPasswordNotification;
use App\Repositories\PasswordResetRepository;
use Illuminate\Support\Str;

class PasswordResetService
{
    public function __construct(
        private PasswordResetRepository $repository
    ) {}

    public function forgotPassword(
        string $email
    ): array {

        $token = Str::random(64);

        $this->repository->createToken(
            $email,
            $token
        );

        User::where('email', $email)
            ->first()
            ?->notify(
                new ResetPasswordNotification($token)
            );

        return [
            'message' => 'Password reset link sent',
        ];
    }

    public function resetPassword(
        ResetPasswordData $data
    ): array {

        $reset = $this->repository->findToken(
            $data->email,
            $data->token
        );

        if (
            !$reset ||
            now()->diffInMinutes($reset->created_at) > 60
        ) {
            abort(400, 'Invalid or expired token');
        }

        $user = User::where(
            'email',
            $data->email
        )->firstOrFail();

        $user->update([
            'password' => bcrypt($data->password),
        ]);

        $this->repository
            ->deleteToken($data->email);

        return [
            'message' => 'Password reset successfully',
        ];
    }
}

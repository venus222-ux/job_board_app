<?php

namespace App\Services\Auth;

use App\DTOs\Auth\UpdateProfileData;
use App\Repositories\UserRepository;

class ProfileService
{
    public function __construct(
        private UserRepository $users
    ) {}

    public function profile(): array
    {
        $user = auth()->user();

        return [
            'name' => $user->name,
            'email' => $user->email,
            'created_at' => $user->created_at,
        ];
    }

    public function update(
        UpdateProfileData $data
    ): array {

        $user = auth()->user();

        $this->users->update(
            $user,
            $data
        );

        return [
            'message' => 'Profile updated successfully',
        ];
    }

    public function destroy(): array
    {
        $user = auth()->user();

        $this->users->delete($user);

        return [
            'message' => 'Account deleted successfully',
        ];
    }
}

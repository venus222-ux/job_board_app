<?php

namespace App\Repositories;

use App\Models\User;
use App\DTOs\Auth\RegisterData;
use App\DTOs\Auth\UpdateProfileData;

class UserRepository
{
    public function create(RegisterData $data): User
    {
        return User::create([
            'name' => $data->name,
            'email' => $data->email,
            'password' => bcrypt($data->password),
            'role' => $data->role,
        ]);
    }

    public function findByEmail(string $email): ?User
    {
        return User::where('email', $email)->first();
    }

    public function update(
        User $user,
        UpdateProfileData $data
    ): User {

        $user->email = $data->email;

        if ($data->password) {
            $user->password = bcrypt($data->password);
        }

        $user->save();

        return $user;
    }

    public function delete(User $user): void
    {
        $user->delete();
    }
}

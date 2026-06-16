<?php

namespace App\Repositories\Admin;

use App\Models\User;

class UserStatsRepository
{
    public function totalUsers(): int
    {
        return User::count();
    }

    public function roleDistribution(): array
    {
        return User::selectRaw('role, count(*) as count')
            ->groupBy('role')
            ->get()
            ->toArray();
    }

    public function recentUsers(int $limit = 5)
    {
        return User::latest()
            ->limit($limit)
            ->get([
                'id',
                'name',
                'email',
                'role',
                'created_at'
            ]);
    }
}

<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run()
    {
        DB::table('users')->truncate(); // safer than delete()

        // Admin
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => 'password123',
            'role' => 'admin',
        ]);

        // Employer
        User::create([
            'name' => 'Employer User',
            'email' => 'employer@example.com',
            'password' => 'password123',
            'role' => 'employer',
        ]);

        // Candidate
        User::create([
            'name' => 'Candidate User',
            'email' => 'candidate@example.com',
            'password' => 'password123',
            'role' => 'candidate',
        ]);

        // More random candidates
        User::factory(7)->create();
    }
}

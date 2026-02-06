<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class UserSeeder extends Seeder
{
    public function run()
    {
        // Disable FK checks to allow truncating tables
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        // Truncate users table safely
        DB::table('users')->truncate();

        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // Create default users
        $users = [
            ['name' => 'Admin User', 'email' => 'admin@example.com', 'password' => Hash::make('password123'), 'role' => 'admin'],
            ['name' => 'Employer User', 'email' => 'employer@example.com', 'password' => Hash::make('password123'), 'role' => 'employer'],
            ['name' => 'Candidate User', 'email' => 'candidate@example.com', 'password' => Hash::make('password123'), 'role' => 'candidate'],
        ];

        foreach ($users as $user) {
            User::create($user);
        }

        // Create 7 random candidates
        User::factory(7)->create();
    }
}

<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Company;
use App\Models\User;

class CompanySeeder extends Seeder
{
    public function run()
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        DB::table('companies')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // Get all employer users
        $employers = User::where('role', 'employer')->get();

        foreach ($employers as $employer) {
            Company::create([
                'user_id' => $employer->id,
                'name' => $employer->name . "'s Company",
                'description' => 'This is a sample company description.',
                'website' => 'https://example.com',
                'logo' => null, // optional
            ]);
        }
    }
}

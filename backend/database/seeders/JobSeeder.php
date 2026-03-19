<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Company;
use App\Models\Job;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class JobSeeder extends Seeder
{
    public function run()
    {
        // Disable FK checks for safe truncate
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        Job::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $companies = Company::all();

        Job::withoutEvents(function () use ($companies) {

            $allCategories = ['Engineering', 'Marketing', 'Sales', 'Design'];

            foreach ($companies as $company) {
                for ($i = 1; $i <= 5; $i++) {
                    $title = $company->name . " Job Position $i";

                    // Pick 1–3 random categories
                    $categories = collect($allCategories)->shuffle()->take(rand(1,3))->values()->toArray();

                    Job::create([
                        'company_id'   => $company->id,
                        'title'        => $title,
                        'description'  => "This is a sample description for {$company->name} Job $i.",
                        'location'     => "City " . rand(1, 10),
                        'status'       => ['draft', 'published', 'closed'][array_rand(['draft','published','closed'])],
                        'published_at' => now()->subDays(rand(0, 30)),
                        'categories' => collect(['Engineering','Marketing','Sales','Design'])
                            ->shuffle()
                            ->take(rand(1,3))
                            ->values()
                            ->toArray(),
                        'slug'         => Str::slug($title . '-' . uniqid()),
                    ]);
                }
            }

        });
    }
}


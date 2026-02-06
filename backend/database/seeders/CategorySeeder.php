<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    public function run()
    {
        $categories = ['Engineering', 'Design', 'Marketing', 'Sales', 'HR'];
        foreach ($categories as $cat) {
            Category::create(['name' => $cat]);
        }
    }
}

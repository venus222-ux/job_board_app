<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Skill;

class SkillSeeder extends Seeder
{
    public function run()
    {
        $skills = ['PHP', 'Laravel', 'React', 'JavaScript', 'TypeScript'];
        foreach ($skills as $skill) {
            Skill::create(['name' => $skill]);
        }
    }
}

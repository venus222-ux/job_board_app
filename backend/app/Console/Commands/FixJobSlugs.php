<?php

namespace App\Console\Commands;

use App\Models\Job;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class FixJobSlugs extends Command
{
    protected $signature = 'jobs:fix-slugs';
    protected $description = 'Generate unique slugs for existing jobs missing them';

    public function handle()
    {
        $jobs = Job::whereNull('slug')->orWhere('slug', '')->get();

        if ($jobs->isEmpty()) {
            $this->info('No jobs need slug updates.');
            return;
        }

        foreach ($jobs as $job) {
            $baseSlug = Str::slug($job->title ?: 'untitled-job-' . $job->id);
            $slug = $baseSlug;
            $counter = 1;

            // Ensure uniqueness
            while (Job::where('slug', $slug)->where('id', '!=', $job->id)->exists()) {
                $slug = $baseSlug . '-' . $counter++;
            }

            $job->slug = $slug;
            $job->saveQuietly();  // Triggers updating hook if needed
        }

        $this->info('Slugs fixed for ' . $jobs->count() . ' jobs!');
    }
}

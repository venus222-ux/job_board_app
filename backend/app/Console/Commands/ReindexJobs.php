<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Job;
use App\Services\ElasticsearchService;
use App\Observers\JobObserver;
use App\Services\JobIndexService;
use Illuminate\Support\Facades\Log;

class ReindexJobs extends Command
{
    protected $signature = 'jobs:reindex';
    protected $description = 'Reindex all published jobs into Elasticsearch';

    public function handle()
    {
        $this->info('Fixing missing slugs...');
        $this->call('jobs:fix-slugs');

        $this->info('Ensuring jobs index exists...');
        JobIndexService::ensureJobsIndex();

        $this->info('Fetching published jobs...');
        $jobs = Job::where('status', 'published')->with('skills', 'company')->get();

        $this->info('Clearing existing index...');
        $this->clearIndex();

        $observer = new JobObserver();
        $bar = $this->output->createProgressBar($jobs->count());
        $bar->start();

        foreach ($jobs as $job) {
            try {
                // Ensure proper data
                $job->categories = is_array($job->categories) ? $job->categories : json_decode($job->categories, true) ?? [];
                $job->published_at = $job->published_at?->toIso8601String();

                $observer->indexJob($job);
            } catch (\Throwable $e) {
                Log::error('Failed to index job in Elasticsearch', [
                    'job_id' => $job->id,
                    'error' => $e->getMessage(),
                ]);
                $this->error("Failed to index job {$job->id}: {$e->getMessage()}");
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info("Reindexing complete! Total published jobs: {$jobs->count()}");
    }

    private function clearIndex()
    {
        try {
            $es = app(ElasticsearchService::class)->client();
            $params = ['index' => 'jobs'];

            if ($es->indices()->exists($params)) {
                $es->indices()->delete($params);
            }

            JobIndexService::ensureJobsIndex();
        } catch (\Throwable $e) {
            $this->error("Failed to clear index: {$e->getMessage()}");
        }
    }
}

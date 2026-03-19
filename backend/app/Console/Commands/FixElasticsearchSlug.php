<?php

namespace App\Console\Commands;

use App\Models\Job;
use App\Services\ElasticsearchService;
use Illuminate\Console\Command;

class FixElasticsearchSlug extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:fix-elasticsearch-slug';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
// App\Console\Commands\FixElasticsearchSlugs.php

public function handle()
{
    $es = app(ElasticsearchService::class)->client();
    $jobs = Job::whereNotNull('slug')->get();

    foreach ($jobs as $job) {
        try {
            $es->update([
                'index' => 'jobs',
                'id' => $job->id,
                'body' => [
                    'doc' => [
                        'slug' => $job->slug
                    ]
                ]
            ]);
            $this->info("Updated slug for job {$job->id}: {$job->slug}");
        } catch (\Throwable $e) {
            $this->error("Failed to update job {$job->id}: {$e->getMessage()}");
        }
    }
}
}

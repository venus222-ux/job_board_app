<?php

namespace App\Observers;

use App\Models\Job;
use App\Services\ElasticsearchService;
use Illuminate\Support\Facades\Log;

class JobObserver
{
    public function created(Job $job)
    {
        $this->indexJob($job);
    }

    public function updated(Job $job)
    {
        $this->indexJob($job);
    }

    public function deleted(Job $job)
    {
        try {
            app(ElasticsearchService::class)->delete('jobs', $job->id);
        } catch (\Elastic\Elasticsearch\Exception\ClientResponseException $e) {
            // ignore 404 (job not in ES)
            if ($e->getCode() !== 404) {
                Log::error("Failed to delete job from Elasticsearch: {$e->getMessage()}");
            }
        } catch (\Exception $e) {
            Log::error("Failed to delete job from Elasticsearch: {$e->getMessage()}");
        }
    }

public function indexJob(Job $job)
{
    if ($job->status !== 'published') return;

    try {
        $payload = $this->payload($job);

        app(ElasticsearchService::class)->index(
            'jobs',
            $job->id,
            $payload
        );
    } catch (\Exception $e) {
        Log::error("Failed to index job {$job->id} in Elasticsearch", [
            'error' => $e->getMessage(),
            'payload' => $payload ?? null,
        ]);
    }
}


protected function payload(Job $job): array
{
    return [
        'title' => $job->title,
        'description' => $job->description,
        'location' => $job->location,
        'categories' => is_array($job->categories) ? $job->categories : json_decode($job->categories, true) ?? [],
        'skills' => $job->skills->pluck('name')->toArray(),
        'job_type' => $job->job_type,
        'salary_min' => $job->salary_min ? (float)$job->salary_min : null,
        'salary_max' => $job->salary_max ? (float)$job->salary_max : null,
        'salary_currency' => $job->salary_currency,
        'salary_type' => $job->salary_type,
        'is_remote' => (bool)$job->is_remote,
        'status' => $job->status,
        'experience_level' => $job->experience_level,
        'published_at' => $job->published_at?->toIso8601String(),
        'company' => [
            'name' => $job->company?->name,
            'slug' => $job->company?->slug,
            'logo' => $job->company?->logo,
        ],
    ];
}

}

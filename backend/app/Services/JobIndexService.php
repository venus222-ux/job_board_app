<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

class JobIndexService
{
    public static function ensureJobsIndex(): void
    {
        $es = app(\App\Services\ElasticsearchService::class)->client();
        $index = 'jobs';

        try {
            $exists = $es->indices()->exists(['index' => $index]);
            if ($exists->asBool()) {
                return;
            }

            $es->indices()->create([
                'index' => $index,
                'body'  => [
                    'settings' => [
                        'number_of_shards'   => 1,
                        'number_of_replicas' => 0,
                    ],
                    'mappings' => [
                        'properties' => [
                            'title'            => ['type' => 'text'],
                            'slug'             => ['type' => 'keyword'], // ✅ ADD THIS
                            'description'      => ['type' => 'text'],
                            'location'         => ['type' => 'text'],
                            'status'           => ['type' => 'keyword'],
                            'skills'           => ['type' => 'keyword'],
                            'job_type'         => ['type' => 'keyword'],
                            'experience_level' => ['type' => 'keyword'],
                            'salary_min'       => ['type' => 'float'],
                            'salary_max'       => ['type' => 'float'],
                            'salary_currency'  => ['type' => 'keyword'],
                            'salary_type'      => ['type' => 'keyword'],
                            'is_remote'        => ['type' => 'boolean'],
                            'published_at'     => ['type' => 'date'],
                            'categories'       => ['type' => 'keyword'], // optional, if you want categories searchable
                            'company'          => [
                                'properties' => [
                                    'name' => ['type' => 'text'],
                                    'logo' => ['type' => 'keyword'],
                                    'slug' => ['type' => 'keyword'], // optional, for company links
                                ],
                            ],
                        ],
                    ],
                ],
            ]);

            Log::info('Elasticsearch index [jobs] created with slug mapping');
        } catch (\Throwable $e) {
            Log::error('Failed to ensure jobs index', ['error' => $e->getMessage()]);
        }
    }
}

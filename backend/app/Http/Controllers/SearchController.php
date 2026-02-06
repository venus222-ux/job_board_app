<?php

namespace App\Http\Controllers;

use App\Services\ElasticsearchService;
use Illuminate\Http\Request;
use App\Services\JobIndexService;


class SearchController extends Controller
{
public function jobs(Request $request, ElasticsearchService $es)
{
    JobIndexService::ensureJobsIndex();

    $query            = $request->string('q')->toString();
    $location         = $request->string('location')->toString();
    $skills = collect(explode(',', $request->get('skills', '')))
            ->filter()
            ->values()
            ->toArray();

    $category         = array_filter(explode(',', $request->get('category', '')));
    $jobType          = $request->string('job_type')->toString();
    $experience       = $request->string('experience_level')->toString();
    $isRemote         = $request->boolean('is_remote');
    $salaryMin        = $request->get('salary_min');
    $salaryMax        = $request->get('salary_max');
    $sort             = $request->string('sort')->toString() ?: 'relevance';

    $must = [];
    $filter = [
        ['term' => ['status' => 'published']]
    ];

    // 🔎 Text search
    if ($query) {
        $must[] = [
            'multi_match' => [
                'query' => $query,
                'fields' => [
                    'title^4',
                    'description',
                    'categories',
                    'skills',
                    'company.name^2'
                ],
                'fuzziness' => 'AUTO'
            ]
        ];
    }

    // 📍 Location (partial match)
    if ($location) {
        $must[] = [
            'match' => [
                'location' => [
                    'query' => $location,
                    'operator' => 'and'
                ]
            ]
        ];
    }

    // 🛠 Skills (match ANY selected skill)
    if (!empty($skills)) {
        $filter[] = [
            'terms' => ['skills' => $skills]
        ];
    }

    // 📂 Categories
    if (!empty($category)) {
        $filter[] = [
            'terms' => ['categories' => $category]
        ];
    }

    // 💼 Job type
    if ($jobType) {
        $filter[] = ['term' => ['job_type' => $jobType]];
    }

    // 📈 Experience
    if ($experience) {
        $filter[] = ['term' => ['experience_level' => $experience]];
    }

    // 🌍 Remote
    if ($request->has('is_remote') && $isRemote) {
        $filter[] = ['term' => ['is_remote' => true]];
    }

    // 💰 Salary Range
    if ($salaryMin || $salaryMax) {
        $range = [];
        if ($salaryMin) $range['gte'] = (float) $salaryMin;
        if ($salaryMax) $range['lte'] = (float) $salaryMax;

        $filter[] = [
            'range' => [
                'salary_min' => $range
            ]
        ];
    }

    $params = [
        'index' => 'jobs',
        'body' => [
            'query' => [
                'bool' => [
                    'must'   => $must,
                    'filter' => $filter
                ]
            ]
        ]
    ];

    // 🔀 Sorting
    switch ($sort) {
        case 'date':
            $params['body']['sort'] = [
                ['published_at' => ['order' => 'desc']]
            ];
            break;

        case 'salary_desc':
            $params['body']['sort'] = [
                ['salary_min' => ['order' => 'desc']]
            ];
            break;

        case 'salary_asc':
            $params['body']['sort'] = [
                ['salary_min' => ['order' => 'asc']]
            ];
            break;
    }

    $response = $es->search($params);
    $hits = $response->asArray()['hits']['hits'] ?? [];

    return response()->json(
        collect($hits)->map(fn($hit) => [
            'id' => $hit['_id'],
            ...$hit['_source']
        ])
    );
}



}

<?php

namespace App\Http\Controllers;

use App\Models\Job;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function jobs(Request $request)
    {
        $query = trim($request->get('query', '')) ?: '*';

        $search = Job::search($query, function ($engine, $query, $options) {
            $boolQuery = [
                'bool' => [
                    'should' => [
                        [
                            'multi_match' => [
                                'query' => $query,
                                'fields' => ['title^2', 'description', 'location', 'company.name'],
                                'type' => 'best_fields',
                            ],
                        ],
                        [
                            'wildcard' => [
                                'skills' => [
                                    'value' => '*' . $query . '*',
                                    'case_insensitive' => true,
                                ],
                            ],
                        ],
                    ],
                ],
            ];

            return ['query' => $boolQuery];
        })->where('status', 'published');

        $search->query(function ($builder) use ($request) {
            $builder->with('skills');

            if ($request->location) {
                $builder->where('location', $request->location);
            }

            if ($request->job_type) {
                $builder->where('job_type', $request->job_type);
            }

            if ($request->experience_level) {
                $builder->where('experience_level', $request->experience_level);
            }

            if ($request->has('is_remote')) {
                $builder->where('is_remote', filter_var($request->is_remote, FILTER_VALIDATE_BOOLEAN));
            }

            if ($request->salary_min) {
                $builder->where('salary_min', '>=', $request->salary_min);
            }

            if ($request->salary_max) {
                $builder->where('salary_max', '<=', $request->salary_max);
            }

            if ($request->skills) {
                $skills = array_filter(explode(',', $request->skills));
                $builder->whereHas('skills', function ($q) use ($skills) {
                    $q->whereIn('name', $skills);
                });
            }

            if ($request->category) {
                $categories = array_filter(explode(',', $request->category));
                $builder->where(function ($q) use ($categories) {
                    foreach ($categories as $cat) {
                        $q->orWhereJsonContains('categories', $cat);
                    }
                });
            }

            if ($request->sort) {
                switch ($request->sort) {
                    case 'date':
                        $builder->orderBy('published_at', 'desc');
                        break;
                    case 'salary_asc':
                        $builder->orderBy('salary_min', 'asc');
                        break;
                    case 'salary_desc':
                        $builder->orderBy('salary_max', 'desc');
                        break;
                    default:
                        $builder->orderBy('id', 'desc');
                }
            }
        });

        $jobs = $search->paginate(10);

        $jobs->getCollection()->transform(function ($job) {
            return [
                'id' => $job->id,
                'title' => $job->title,
                'slug' => $job->slug,
                'location' => $job->location,
                'salary_min' => $job->salary_min,
                'salary_max' => $job->salary_max,
                'salary_currency' => $job->salary_currency,
                'salary_type' => $job->salary_type,
                'is_remote' => $job->is_remote,
                'experience_level' => $job->experience_level,
                'job_type' => $job->job_type,
                'status' => $job->status,
                'categories' => $job->categories ?? [],
                'skills' => $job->skills->pluck('name')->toArray(),
            ];
        });

        return response()->json($jobs);
    }

    public function autocomplete(Request $request)
    {
        $query = trim($request->get('query'));
        if (!$query) {
            return response()->json([]);
        }

        $results = Job::search($query)
            ->where('status', 'published')
            ->take(5)
            ->get()
            ->pluck('title');

        return response()->json($results);
    }
}

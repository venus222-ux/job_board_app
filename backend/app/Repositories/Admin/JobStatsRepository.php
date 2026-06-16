<?php

namespace App\Repositories\Admin;

use App\Models\Job;
use Illuminate\Support\Facades\DB;

class JobStatsRepository
{
    public function totalJobs(): int
    {
        return Job::count();
    }

    public function activeJobs(): int
    {
        return Job::where('status', 'published')
            ->count();
    }

    public function statusDistribution(): array
    {
        return Job::select(
            'status',
            DB::raw('count(*) as count')
        )
            ->groupBy('status')
            ->get()
            ->toArray();
    }

    public function typeDistribution(): array
    {
        return Job::select(
            'job_type as type',
            DB::raw('count(*) as count')
        )
            ->groupBy('job_type')
            ->get()
            ->toArray();
    }
}

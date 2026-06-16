<?php

namespace App\Repositories\Admin;

use App\Models\Application;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ApplicationStatsRepository
{
    public function totalApplications(): int
    {
        return Application::count();
    }

    public function pendingApplications(): int
    {
        return Application::whereNull('viewed_at')
            ->count();
    }

    public function recentApplications(
        int $limit = 5
    ) {
        return Application::with(
            'candidate',
            'job'
        )
            ->latest()
            ->limit($limit)
            ->get()
            ->map(fn ($application) => [
                'id' => $application->id,

                'candidate' => [
                    'name' => $application->candidate->name ?? 'Unknown'
                ],

                'job' => [
                    'title' => $application->job->title ?? 'Unknown'
                ],

                'created_at' => $application->created_at,
                'viewed_at' => $application->viewed_at,
            ]);
    }

    public function monthlyApplications(
        Carbon $startDate
    ): array {
        return Application::select(
            DB::raw("DATE_FORMAT(created_at, '%Y-%m') as month"),
            DB::raw("count(*) as count")
        )
            ->where('created_at', '>=', $startDate)
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->toArray();
    }
}

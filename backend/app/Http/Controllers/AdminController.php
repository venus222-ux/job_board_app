<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\Company;
use App\Models\Job;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use App\Models\Mongo\JobView;
use App\Models\Mongo\ApplicationLog;
use App\Models\Mongo\ActivityLog;
use MongoDB\BSON\UTCDateTime;

class AdminController extends Controller
{
    public function dashboard(Request $request)
    {
        $range = $request->query('range', '30d');
        $startDate = match($range) {
            '7d' => now()->subDays(7),
            '30d' => now()->subDays(30),
            '90d' => now()->subDays(90),
            default => now()->subDays(30)
        };

        // -----------------------------
        // SQL stats
        // -----------------------------
        $totalUsers = User::count();
        $totalCompanies = Company::count();
        $totalJobs = Job::count();
        $activeJobs = Job::where('status', 'published')->count();
        $totalApplications = Application::count();
        $pendingApplications = Application::whereNull('viewed_at')->count();

        $recentUsers = User::orderBy('created_at', 'desc')
            ->limit(5)
            ->get(['id','name','email','role','created_at']);

        $recentApplications = Application::with('candidate','job')
            ->orderBy('created_at','desc')
            ->limit(5)
            ->get()
            ->map(fn($app) => [
                'id' => $app->id,
                'candidate' => ['name' => $app->candidate->name ?? 'Unknown'],
                'job' => ['title' => $app->job->title ?? 'Unknown'],
                'created_at' => $app->created_at,
                'viewed_at' => $app->viewed_at,
            ]);

        // -----------------------------
        // MongoDB stats
        // -----------------------------
        $jobStatusDistribution = Job::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get()
            ->toArray();

        $userRoleDistribution = User::select('role', DB::raw('count(*) as count'))
            ->groupBy('role')
            ->get()
            ->toArray();

        // Applications per month
        $monthlyApplications = Application::select(
                DB::raw("DATE_FORMAT(created_at, '%Y-%m') as month"),
                DB::raw("count(*) as count")
            )
            ->where('created_at', '>=', $startDate)
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->toArray();

        // Job type distribution
        $jobTypeDistribution = Job::select('job_type as type', DB::raw('count(*) as count'))
            ->groupBy('job_type')
            ->get()
            ->toArray();

     $recentJobViews = JobView::raw(function($collection) use ($startDate) {
    $startMongoDate = new UTCDateTime($startDate->getTimestamp() * 1000);

    return $collection->aggregate([
        ['$match' => ['created_at' => ['$gte' => $startMongoDate]]],
        ['$group' => [
            '_id' => '$job_id',
            'views' => ['$sum' => ['$ifNull' => ['$views', 1]]], // sum 'views' if exists, else count 1
        ]],
        ['$sort' => ['views' => -1]],
        ['$limit' => 10],
    ]);
});

        // Mongo: Recent activity logs
        $recentActivityLogs = ActivityLog::where('created_at', '>=', $startDate)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        // Mongo: Application logs
        $recentApplicationLogs = ApplicationLog::where('created_at', '>=', $startDate)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        // Mongo: Activity stats
        $activityStats = ActivityLog::raw(function($collection) use ($startDate) {
            return $collection->aggregate([
                ['$match' => ['created_at' => ['$gte' => new \MongoDB\BSON\UTCDateTime($startDate->timestamp * 1000)]]],
                ['$group' => [
                    '_id' => '$type',
                    'count' => ['$sum' => 1]
                ]]
            ]);
        });

        // Convert MongoDB results to array
        $recentJobViewsArray = iterator_to_array($recentJobViews);

        // Ensure each item has the correct structure
        $formattedJobViews = array_map(function($item) {
            return [
                '_id' => (string)($item['_id'] ?? $item->_id ?? ''),
                'views' => (int)($item['views'] ?? $item->views ?? 0)
            ];
        }, $recentJobViewsArray);

        return response()->json([
            'totalUsers' => $totalUsers,
            'totalCompanies' => $totalCompanies,
            'totalJobs' => $totalJobs,
            'activeJobs' => $activeJobs,
            'totalApplications' => $totalApplications,
            'pendingApplications' => $pendingApplications,
            'recentUsers' => $recentUsers,
            'recentApplications' => $recentApplications,
            'jobStatusDistribution' => $jobStatusDistribution,
            'userRoleDistribution' => $userRoleDistribution,
            'monthlyApplications' => $monthlyApplications,
            'jobTypeDistribution' => $jobTypeDistribution,
            'recentJobViews' => $formattedJobViews,
            // Additional MongoDB data you can add to your frontend
            'recentActivityLogs' => $recentActivityLogs,
            'recentApplicationLogs' => $recentApplicationLogs,
            'activityStats' => iterator_to_array($activityStats),
        ]);
    }
}

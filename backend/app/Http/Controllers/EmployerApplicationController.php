<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Job;
use App\Services\Application\ApplicationService;
use Illuminate\Support\Facades\Auth;
use App\Actions\Applications\DownloadResumeAction;
use App\Models\Application;
use App\Services\Job\JobService;

class EmployerApplicationController extends Controller
{
public function __construct(
    private JobService $jobService,
    private ApplicationService $applicationService
) {}

    // List applications for a job (employer only)
    public function index(Job $job)
    {
        return response()->json(
            $this->applicationService->getJobApplications($job, Auth::id())
        );
    }

    // Mark application as viewed
    public function markViewed($id)
    {
        return response()->json(
            $this->applicationService->markViewed($id, Auth::id())
        );
    }

    // Jobs with applications
public function jobsWithApplications($companyId)
{
    return response()->json(
        $this->jobService->jobsWithApplications($companyId)
    );
}

public function downloadResume($id, DownloadResumeAction $action)
{
    $application = Application::findOrFail($id);

    return $action->execute($application);
}
}

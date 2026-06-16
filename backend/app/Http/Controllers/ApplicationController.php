<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\Application\ApplyJobRequest;
use App\Models\Job;
use App\Services\Application\ApplicationService;
use Illuminate\Support\Facades\Auth;

class ApplicationController extends Controller
{
    public function __construct(
        private ApplicationService $applicationService
    ) {}

    // Apply to job
    public function store(ApplyJobRequest $request, Job $job)
    {
        return response()->json(
            $this->applicationService->apply(
                $job,
                Auth::id(),
                $request->file('resume')
            ),
            201
        );
    }

    // Undo apply
    public function undo($id)
    {
        return response()->json(
            $this->applicationService->undo($id, Auth::id())
        );
    }

    // Candidate history
    public function myApplications()
    {
        return response()->json(
            $this->applicationService->myApplications(Auth::id())
        );
    }
}

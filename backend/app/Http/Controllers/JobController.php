<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\Job\StoreJobRequest;
use App\Http\Requests\Job\UpdateJobRequest;
use App\Http\Requests\Job\ChangeJobStatusRequest;
use App\Models\Job;
use App\Services\Job\JobService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class JobController extends Controller
{
    public function __construct(
        private JobService $jobService
    ) {}

    // ---------------- Employer jobs ----------------
    public function employerIndex($companyId)
    {
        return response()->json(
            $this->jobService->getEmployerJobs($companyId, Auth::id())
        );
    }

    public function store(StoreJobRequest $request, $companyId)
    {
        return response()->json(
            $this->jobService->createJob($request->dto(), $companyId, Auth::id()),
            201
        );
    }

    public function update(UpdateJobRequest $request, $id)
    {
        return response()->json(
            $this->jobService->updateJob($id, $request->dto(), Auth::id())
        );
    }

    public function destroy($id)
    {
        $this->jobService->deleteJob($id, Auth::id());

        return response()->json(['message' => 'Job deleted']);
    }

    // ---------------- Public ----------------
    public function index(Request $request)
    {
        return response()->json(
            $this->jobService->listJobs($request->all())
        );
    }

    public function show($slug)
    {
        return response()->json(
            $this->jobService->showJob($slug)
        );
    }

    public function showById($id)
    {
        return response()->json(
            $this->jobService->showById($id)
        );
    }

    // ---------------- Status ----------------
    public function changeStatus(ChangeJobStatusRequest $request, $id)
    {
        return response()->json(
            $this->jobService->changeStatus($id, $request->status, Auth::id())
        );
    }

    // ---------------- Candidate ----------------
    public function trackView(Job $job, Request $request)
    {
        return response()->json(
            $this->jobService->trackView($job, $request, Auth::id())
        );
    }

    public function applyToJob(Request $request, Job $job)
    {
        $request->validate([
            'resume' => 'required|mimes:pdf|max:2048',
        ]);

        return response()->json(
            $this->jobService->applyToJob($job, $request->file('resume'), Auth::id()),
            201
        );
    }

    // ---------------- Employer applications ----------------
    public function markViewed($id)
    {
        return response()->json(
            $this->jobService->markApplicationViewed($id, Auth::id())
        );
    }

    public function jobsWithApplications($companyId)
    {
        return response()->json(
            $this->jobService->jobsWithApplications($companyId)
        );
    }
}

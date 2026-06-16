<?php

namespace App\Services\Application;

use App\Models\Application;
use App\Models\Job;
use App\Models\Mongo\ApplicationLog;
use Illuminate\Support\Facades\Storage;
use App\Events\ApplicationViewed;


class ApplicationService
{
    // ---------------- APPLY ----------------
    public function apply(Job $job, int $userId, $resumeFile)
    {
        if ($job->status !== 'published') {
            abort(422, 'Job not available');
        }

        if ($job->applications()->where('user_id', $userId)->exists()) {
            abort(409, 'Already applied');
        }

        $path = $resumeFile->store('resumes', 'public');

        $application = $job->applications()->create([
            'user_id' => $userId,
            'resume_path' => $path,
        ]);

        ApplicationLog::create([
            'application_id' => $application->id,
            'event' => 'applied',
            'meta' => [
                'user_id' => $userId,
                'job_id' => $job->id,
            ]
        ]);

        return $application;
    }

    // ---------------- UNDO ----------------
    public function undo(int $applicationId, int $userId)
    {
        $application = Application::where('id', $applicationId)
            ->where('user_id', $userId)
            ->firstOrFail();

        if ($application->created_at->diffInSeconds(now()) > 3) {
            abort(403, 'Undo time expired');
        }

        Storage::disk('public')->delete($application->resume_path);

        $application->delete();

        ApplicationLog::create([
            'application_id' => $applicationId,
            'event' => 'undone',
            'meta' => ['user_id' => $userId]
        ]);

        return ['message' => 'Application undone'];
    }

    // ---------------- HISTORY ----------------
    public function myApplications(int $userId)
    {
        return Application::where('user_id', $userId)
            ->with(['job.company'])
            ->latest()
            ->get()
            ->map(function ($app) {
                if (!$app->job) return null;

                return [
                    'id' => $app->id,
                    'created_at' => $app->created_at,
                    'viewed_at' => $app->viewed_at,
                    'cv_url' => $app->resume_path
                        ? asset('storage/' . $app->resume_path)
                        : null,
                    'job' => [
                        'id' => $app->job->id,
                        'title' => $app->job->title,
                        'location' => $app->job->location,
                        'company' => [
                            'id' => $app->job->company->id,
                            'name' => $app->job->company->name,
                            'logo' => $app->job->company->logo ?? null,
                            'website' => $app->job->company->website ?? null,
                        ],
                    ],
                ];
            })
            ->filter()
            ->values();
    }

    public function getJobApplications(Job $job, int $userId)
{
    // optional: authorization logic can be moved to Policy
    return $job->applications()
        ->with('candidate:id,name,email')
        ->latest()
        ->get();
}


public function markViewed(int $id, int $userId)
{
    $application = Application::with(['job.company', 'candidate'])
        ->findOrFail($id);

    $application->update([
        'viewed_at' => now()
    ]);

    // event (clean architecture)
    event(new ApplicationViewed($application));

    return ['message' => 'Marked as viewed'];
}


// ---------------- JOBS WITH APPLICATIONS ----------------
    public function jobsWithApplications(int $companyId)
    {
        return Job::where('company_id', $companyId)
            ->with(['applications.candidate'])
            ->get();
    }

    // ---------------- DOWNLOAD RESUME ----------------
    public function downloadResume(int $applicationId, int $userId)
    {
        $application = Application::with(['job.company', 'candidate'])
            ->findOrFail($applicationId);

        // security check (employer owns company)
        if ($application->job->company->user_id !== $userId) {
            abort(403, 'Unauthorized');
        }

        if (!Storage::disk('public')->exists($application->resume_path)) {
            abort(404, 'Resume not found');
        }

        return response()->download(
            storage_path('app/public/' . $application->resume_path),
            'resume_' . $application->id . '.pdf'
        );
    }
}

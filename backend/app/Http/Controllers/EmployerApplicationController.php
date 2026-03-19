<?php

namespace App\Http\Controllers;

use App\Jobs\SendResumeDownloadedEmail;
use App\Mail\ApplicationViewedMail;
use App\Mail\ResumeDownloadedMail;
use App\Models\Application;
use App\Models\Job;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Routing\Controller as BaseController;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class EmployerApplicationController extends Controller
{
    use AuthorizesRequests, ValidatesRequests;

    public function index(Job $job)
    {
        $this->authorize('view', $job);

        return $job->applications()
            ->with('candidate:id,name,email')
            ->latest()
            ->get();
    }

    public function markViewed($id)
    {
        $application = Application::findOrFail($id);
        $application->update(['viewed_at' => now()]);

        // 📧 Email candidate
        Mail::to($application->candidate->email)
            ->onQueue('emails')
            ->queue(new ResumeDownloadedMail($application));

        return response()->json(['message' => 'Marked as viewed']);
    }

    public function jobsWithApplications($companyId)
    {
        $jobs = Job::where('company_id', $companyId)
            ->with(['applications.candidate'])
            ->get();

        return response()->json($jobs);
    }

    /**
     * Download candidate resume for employer
     */
public function downloadResume($id)
{
    $application = Application::with(['job.company', 'candidate'])->findOrFail($id);
    $this->authorize('view', $application->job);

    if (!Storage::disk('public')->exists($application->resume_path)) {
        return response()->json(['message' => 'Resume not found'], 404);
    }

    // Dispatch Job to send email asynchronously
    try {
        SendResumeDownloadedEmail::dispatch($application);

        // Optional logging
        Log::info('Resume downloaded notification job dispatched', [
            'application_id' => $application->id,
            'candidate_email' => $application->candidate->email,
            'company' => $application->job->company->name ?? 'Unknown'
        ]);
    } catch (\Exception $e) {
        // Log error but don't prevent download
        Log::error('Failed to dispatch resume download notification: ' . $e->getMessage());
    }

    // Prepare download file name
    $fileName = basename($application->resume_path);
    $downloadName = $application->candidate->name
        ? 'Resume_' . str_replace(' ', '_', $application->candidate->name) . '_' . $application->job->company->name . '.pdf'
        : $fileName;

    // PDF headers
    $headers = [];
    if (pathinfo($fileName, PATHINFO_EXTENSION) === 'pdf') {
        $headers['Content-Type'] = 'application/pdf';
    }

    return response()->download(
        storage_path('app/public/' . $application->resume_path),
        $downloadName,
        $headers
    );
}
}

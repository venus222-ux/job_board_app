<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\Job;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class ApplicationController extends Controller
{
    //Apply to job
    public function store(Request $request, Job $job)
{
    if ($job->status !== 'published') {
        return response()->json(['message' => 'Job not available'], 422);
    }

    $request->validate([
        'resume' => 'required|mimes:pdf|max:2048',
    ]);

    // ⛔ Prevent duplicate (extra safety)
    if ($job->applications()->where('user_id', Auth::id())->exists()) {
        return response()->json(['message' => 'Already applied'], 409);
    }

    $path = $request->file('resume')->store('resumes', 'public');

    $application = $job->applications()->create([
        'user_id' => Auth::id(),
        'resume_path' => $path,
    ]);

    return response()->json($application, 201);
}

//Undo apply (3 seconds)
public function undo($id)
{
    $application = Application::where('id', $id)
        ->where('user_id', Auth::id())
        ->firstOrFail();

    if ($application->created_at->diffInSeconds(now()) > 3) {
        return response()->json(['message' => 'Undo time expired'], 403);
    }

    Storage::disk('public')->delete($application->resume_path);
    $application->delete();

    return response()->json(['message' => 'Application undone']);
}

//Candidate application history
public function myApplications()
{
    $apps = Auth::user()
        ->applications()
        ->with('job.company')
        ->latest()
        ->get()
        ->map(function ($app) {
            // If job is missing, skip this application
            if (!$app->job) return null;

            return [
                'id' => $app->id,
                'created_at' => $app->created_at,
                'viewed_at' => $app->viewed_at,
                'cv_url' => $app->resume_path ? asset('storage/' . $app->resume_path) : null,
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
        ->filter() // remove null applications where job was missing
        ->values();

    return response()->json($apps);
}





}

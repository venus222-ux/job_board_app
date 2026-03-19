<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\Job;
use App\Models\Skill;
use App\Models\Application;
use App\Models\Mongo\JobView;
use App\Models\Mongo\ApplicationLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use App\Services\ElasticsearchService;
use App\Mail\ResumeDownloadedMail;

class JobController extends Controller
{
    // -----------------------------
    // Employer: list jobs for a company
    // -----------------------------
    public function employerIndex($companyId)
    {
        $company = Company::where('user_id', Auth::id())
            ->where('id', $companyId)
            ->firstOrFail();

        $jobs = $company->jobs()->latest()->paginate(3);

        $jobs->getCollection()->transform(function ($job) {
            return [
                ...$job->toArray(),
                'categories' => is_array($job->categories) ? $job->categories : json_decode($job->categories, true),
            ];
        });

        return response()->json($jobs);
    }

    // -----------------------------
    // Employer: create job (OLD store method)
    // -----------------------------
    public function store(Request $request, $companyId)
    {
        $company = Company::where('user_id', Auth::id())
            ->where('id', $companyId)
            ->firstOrFail();

        $data = $request->validate([
            'title' => 'required|string',
            'description' => 'required|string',
            'location' => 'required|string',
            'status' => 'required|in:draft,published,closed',
            'categories' => 'nullable|array',
            'categories.*' => 'string',
            'skills' => 'nullable|array',
            'skills.*' => 'integer|exists:skills,id',
            'job_type' => 'nullable|string',
            'salary_min' => 'nullable|numeric|min:0',
            'salary_max' => 'nullable|numeric|min:0',
            'salary_currency' => 'nullable|string|max:5',
            'salary_type' => 'nullable|in:hourly,monthly,yearly',
            'is_remote' => 'nullable|boolean',
            'experience_level' => 'nullable|in:junior,mid,senior',
        ]);

        $data['categories'] = $data['categories'] ?? [];
        $data['experience_level'] = $data['experience_level'] ?? 'junior';
        $data['is_remote'] = $data['is_remote'] ?? false;

        $job = $company->jobs()->create($data);

        if (!empty($data['skills'])) {
            $job->skills()->sync($data['skills']);
        }

        return response()->json($job->fresh());
    }

    // -----------------------------
    // Employer: update job
    // -----------------------------
    public function update(Request $request, $id)
    {
        $job = Job::whereHas('company', fn($q) => $q->where('user_id', Auth::id()))
            ->findOrFail($id);

        $data = $request->validate([
            'title' => 'required|string',
            'description' => 'required|string',
            'location' => 'required|string',
            'status' => 'required|in:draft,published,closed',
            'categories' => 'nullable|array',
            'categories.*' => 'string',
            'skills' => 'nullable|array',
            'skills.*' => 'integer|exists:skills,id',
            'job_type' => 'nullable|string',
            'salary_min' => 'nullable|numeric|min:0',
            'salary_max' => 'nullable|numeric|min:0',
            'salary_currency' => 'nullable|string|max:5',
            'salary_type' => 'nullable|in:hourly,monthly,yearly',
            'is_remote' => 'nullable|boolean',
            'experience_level' => 'nullable|in:junior,mid,senior',
        ]);

        $data['categories'] = $data['categories'] ?? [];
        $data['experience_level'] = $data['experience_level'] ?? 'junior';
        $data['is_remote'] = $data['is_remote'] ?? false;

        $job->update($data);

        if (!empty($data['skills'])) {
            $job->skills()->sync($data['skills']);
        }

        $this->indexJobES($job);

        return response()->json($job->fresh());
    }

    // -----------------------------
    // Employer: delete job
    // -----------------------------
    public function destroy($id)
    {
        $job = Job::whereHas('company', fn($q) => $q->where('user_id', Auth::id()))
            ->findOrFail($id);

        $job->skills()->detach();
        $job->delete();

        try {
            $es = app(ElasticsearchService::class)->client();
            $es->delete(['index' => 'jobs', 'id' => $job->id]);
        } catch (\Exception $e) {
            Log::warning("Elasticsearch delete failed for job {$job->id}: {$e->getMessage()}");
        }

        return response()->json(['message' => 'Job deleted']);
    }

    // -----------------------------
    // Public: list published jobs
    // -----------------------------
    public function index(Request $request)
    {
        $q = $request->query('q');
        $perPage = $request->query('per_page', 10);

        $jobsQuery = Job::query()
            ->when($q, fn($query) => $query->where('title', 'like', "%$q%"))
            ->with(['company:id,name,slug,logo', 'skills']);

        $jobs = $jobsQuery->paginate($perPage, [
            'id', 'title', 'slug', 'location', 'salary_min', 'salary_max',
            'salary_currency', 'salary_type', 'is_remote', 'experience_level',
            'job_type', 'company_id', 'categories', 'status'
        ]);

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
                'company' => $job->company,
                'categories' => is_array($job->categories) ? $job->categories : json_decode($job->categories, true) ?? [],
                'skills' => $job->skills->map(fn($s) => ['id' => $s->id, 'name' => $s->name])->toArray(),
            ];
        });

        return response()->json($jobs);
    }

    // -----------------------------
    // Public: show a job by ID or slug
    // -----------------------------
    // Public: show job by slug
    public function show(Job $job)
    {
       $job->load(['company', 'skills']);

       return response()->json($job);
    }

    // -----------------------------
    // Internal/admin: show job by ID
    // -----------------------------
    public function showById($id)
    {
        $job = Job::where('id', $id)->with('company')->firstOrFail();
        $job->categories = is_array($job->categories) ? $job->categories : json_decode($job->categories, true);

        return response()->json($job);
    }

    // -----------------------------
    // Employer: change job status
    // -----------------------------
    public function changeStatus(Request $request, $id)
    {
        $job = Job::whereHas('company', fn($q) => $q->where('user_id', Auth::id()))->findOrFail($id);

        $data = $request->validate(['status' => 'required|in:draft,published,closed']);

        if ($data['status'] === 'published' && !$job->published_at) {
            $job->published_at = now();
        }

        $job->status = $data['status'];
        $job->save();

        $job->categories = is_array($job->categories) ? $job->categories : json_decode($job->categories, true);

        $this->indexJobES($job);

        return response()->json($job);
    }

    // -----------------------------
    // Helper: Index job in Elasticsearch
    // -----------------------------
protected function indexJobES($job)
{
    try {
        $es = app(ElasticsearchService::class)->client();
        $es->index([
            'index' => 'jobs',
            'id' => $job->id,
            'body' => $job->toSearchableArray(),
        ]);
    } catch (\Exception $e) {
        Log::warning("Elasticsearch index failed for job {$job->id}: {$e->getMessage()}");
    }
}
    // -----------------------------
    // Candidate: show job + track views
    // -----------------------------
    public function trackView(Job $job, Request $request)
    {
        JobView::create([
            'job_id' => $job->id,
            'user_id' => Auth::id(),
            'ip' => $request->ip(),
            'source' => $request->get('source', 'direct'),
            'created_at' => now()
        ]);

        $job->categories = is_array($job->categories) ? $job->categories : json_decode($job->categories, true) ?? [];

        return response()->json($job);
    }

    // -----------------------------
    // Candidate: apply to a job
    // -----------------------------
    public function applyToJob(Request $request, Job $job)
    {
        if ($job->status !== 'published') {
            return response()->json(['message' => 'Job not available'], 422);
        }

        $request->validate([
            'resume' => 'required|mimes:pdf|max:2048',
        ]);

        if ($job->applications()->where('user_id', Auth::id())->exists()) {
            return response()->json(['message' => 'Already applied'], 409);
        }

        $path = $request->file('resume')->store('resumes', 'public');

        $application = $job->applications()->create([
            'user_id' => Auth::id(),
            'resume_path' => $path,
        ]);

        ApplicationLog::create([
            'application_id' => $application->id,
            'event' => 'applied',
            'meta' => [
                'user_id' => Auth::id(),
                'job_id' => $application->job_id
            ],
            'created_at' => now()
        ]);

        return response()->json($application, 201);
    }

    // -----------------------------
    // Employer: mark application viewed
    // -----------------------------
    public function markViewed($id)
    {
        $application = Application::findOrFail($id);
        $application->update(['viewed_at' => now()]);

        ApplicationLog::create([
            'application_id' => $application->id,
            'event' => 'viewed',
            'meta' => ['employer_id' => Auth::id()],
            'created_at' => now()
        ]);

        Mail::to($application->candidate->email)
            ->onQueue('emails')
            ->queue(new ResumeDownloadedMail($application));

        return response()->json(['message' => 'Marked as viewed']);
    }

    // -----------------------------
    // Employer: list jobs with applications
    // -----------------------------
    public function jobsWithApplications($companyId)
    {
        $jobs = Job::where('company_id', $companyId)
            ->with(['applications.candidate'])
            ->get();

        return response()->json($jobs);
    }
}

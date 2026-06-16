<?php

namespace App\Services\Job;

use App\DTOs\JobData;
use App\Models\Company;
use App\Models\Job;
use App\Models\Application;
use App\Models\Mongo\JobView;
use App\Models\Mongo\ApplicationLog;
use App\Services\ElasticsearchService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class JobService
{
  public function __construct(
    private ElasticsearchService $es
) {}

    // ---------------- Employer ----------------
    public function getEmployerJobs($companyId, $userId)
    {
        $company = Company::where('user_id', $userId)
            ->where('id', $companyId)
            ->firstOrFail();

        return $company->jobs()->latest()->paginate(10);
    }

    public function createJob(JobData $data, $companyId, $userId)
    {
        $company = Company::where('user_id', $userId)
            ->where('id', $companyId)
            ->firstOrFail();

        $job = $company->jobs()->create([
            ... (array) $data
        ]);

        if ($data->skills) {
            $job->skills()->sync($data->skills);
        }

        $this->index($job);

        return $job->fresh();
    }

    public function updateJob($id, JobData $data, $userId)
    {
        $job = Job::whereHas('company', fn($q) =>
            $q->where('user_id', $userId)
        )->findOrFail($id);

        $job->update((array) $data);

        $job->skills()->sync($data->skills ?? []);

        $this->index($job);

        return $job->fresh();
    }

    public function deleteJob($id, $userId)
    {
        $job = Job::whereHas('company', fn($q) =>
            $q->where('user_id', $userId)
        )->findOrFail($id);

        $job->skills()->detach();
        $job->delete();

        try {
            $this->es->client()->delete([
                'index' => 'jobs',
                'id' => $job->id
            ]);
        } catch (\Exception $e) {
            Log::warning($e->getMessage());
        }
    }

    // ---------------- Public ----------------
    public function listJobs($filters)
    {
        return Job::query()
            ->with(['company:id,name,slug,logo', 'skills'])
            ->when($filters['q'] ?? null, fn($q, $v) =>
                $q->where('title', 'like', "%$v%")
            )
            ->paginate($filters['per_page'] ?? 10);
    }

    public function showJob($slug)
    {
        $job = Job::where('slug', $slug)->firstOrFail();

        $user = auth('api')->user();

        return [
            'job' => $job,
            'already_applied' => $user
                ? $job->applications()->where('user_id', $user->id)->exists()
                : false
        ];
    }

    public function showById($id)
    {
        return Job::with('company')->findOrFail($id);
    }

    // ---------------- Status ----------------
    public function changeStatus($id, $status, $userId)
    {
        $job = Job::whereHas('company', fn($q) =>
            $q->where('user_id', $userId)
        )->findOrFail($id);

        if ($status === 'published' && !$job->published_at) {
            $job->published_at = now();
        }

        $job->status = $status;
        $job->save();

        $this->index($job);

        return $job;
    }

    // ---------------- Candidate ----------------
    public function trackView(Job $job, $request, $userId)
    {
        JobView::create([
            'job_id' => $job->id,
            'user_id' => $userId,
            'ip' => $request->ip(),
            'source' => $request->get('source', 'direct'),
        ]);

        return $job;
    }

    public function applyToJob(Job $job, $file, $userId)
    {
        if ($job->status !== 'published') {
            abort(422, 'Job not available');
        }

        if ($job->applications()->where('user_id', $userId)->exists()) {
            abort(409, 'Already applied');
        }

        $path = $file->store('resumes', 'public');

        $application = $job->applications()->create([
            'user_id' => $userId,
            'resume_path' => $path,
        ]);

        ApplicationLog::create([
            'application_id' => $application->id,
            'event' => 'applied',
            'meta' => ['user_id' => $userId]
        ]);

        return $application;
    }

    public function markApplicationViewed($id, $userId)
    {
        $application = Application::findOrFail($id);
        $application->update(['viewed_at' => now()]);

        ApplicationLog::create([
            'application_id' => $id,
            'event' => 'viewed',
            'meta' => ['employer_id' => $userId]
        ]);

        return ['message' => 'marked viewed'];
    }


    public function jobsWithApplications(int $companyId)
{
    return Job::where('company_id', $companyId)
        ->with(['applications.candidate'])
        ->get();
}

    // ---------------- Elasticsearch ----------------
    private function index(Job $job)
    {
        try {
            $this->es->client()->index([
                'index' => 'jobs',
                'id' => $job->id,
                'body' => $job->toSearchableArray(),
            ]);
        } catch (\Exception $e) {
            Log::warning($e->getMessage());
        }
    }

}

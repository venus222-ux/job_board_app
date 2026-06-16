<?php

namespace App\Http\Requests\Job;

use App\DTOs\JobData;
use Illuminate\Foundation\Http\FormRequest;

class StoreJobRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'title' => 'required|string',
            'description' => 'required|string',
            'location' => 'required|string',
            'status' => 'required|in:draft,published,closed',
            'categories' => 'nullable|array',
            'skills' => 'nullable|array',
        ];
    }

    public function dto(): JobData
    {
        return new JobData(
            title: $this->title,
            description: $this->description,
            location: $this->location,
            status: $this->status,
            categories: $this->categories ?? [],
            skills: $this->skills ?? [],
            job_type: $this->job_type,
            salary_min: $this->salary_min,
            salary_max: $this->salary_max,
            salary_currency: $this->salary_currency,
            salary_type: $this->salary_type,
            is_remote: $this->is_remote ?? false,
            experience_level: $this->experience_level ?? 'junior',
        );
    }
}

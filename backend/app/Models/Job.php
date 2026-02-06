<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Job extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'company_id',
        'title',
        'slug',
        'description',
        'location',
        'status',
        'published_at',
        'categories',
        'job_type',
        'salary_min',
        'salary_max',
        'salary_currency',
        'salary_type',
        'is_remote',
        'experience_level', // NEW
    ];

    protected $casts = [
        'published_at' => 'datetime',
        'categories' => 'array',
        'is_remote' => 'boolean',
    ];

// app/Models/Job.php

protected static function booted()
{
    static::creating(function ($job) {
        $job->slug = $job->generateUniqueSlug($job->title ?: 'untitled-job');
    });

    static::updating(function ($job) {
        // Always ensure slug exists, even if title didn't change
        if ($job->isDirty('title') || !$job->slug) {
            $job->slug = $job->generateUniqueSlug($job->title ?: 'untitled-job');
        }
    });

    static::saving(function ($job) {
        // Last resort - ensure slug exists before saving
        if (empty($job->slug)) {
            $job->slug = $job->generateUniqueSlug($job->title ?: 'untitled-job-' . ($job->id ?: rand()));
        }
    });
}

protected function generateUniqueSlug($title)
{
    $baseSlug = Str::slug($title);
    if (empty($baseSlug)) {
        $baseSlug = 'job-' . ($this->id ?: rand(1000, 9999));
    }

    $slug = $baseSlug;
    $counter = 1;

    while (static::where('slug', $slug)->where('id', '!=', $this->id ?? 0)->exists()) {
        $slug = $baseSlug . '-' . $counter++;
    }

    return $slug;
}

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function skills()
    {
        return $this->belongsToMany(Skill::class);
    }

    public function applications()
    {
       return $this->hasMany(Application::class);
    }

    // Use slug for route model binding
    public function getRouteKeyName(): string
    {
        return 'slug';
    }



}

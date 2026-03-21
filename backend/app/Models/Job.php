<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;
use Laravel\Scout\Searchable;

class Job extends Model
{
    use Searchable, SoftDeletes;

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
        'experience_level',
    ];

    protected $casts = [
        'published_at' => 'datetime',
        'categories' => 'array',
        'is_remote' => 'boolean',
    ];

    /*
    |--------------------------------------------------------------------------
    | Boot Model
    |--------------------------------------------------------------------------
    */

    protected static function booted()
    {
        static::creating(function ($job) {
            $job->slug = $job->generateSlug($job->title);
        });

        static::updating(function ($job) {

            // only regenerate slug if title changes
            if ($job->isDirty('title')) {
                $job->slug = $job->generateSlug($job->title);
            }

        });
    }

    /*
    |--------------------------------------------------------------------------
    | Generate Unique SEO Slug
    |--------------------------------------------------------------------------
    */


    public function generateSlug(string $title): string
    {
        $base = Str::slug($title);

        if (!$base) {
            $base = 'job';
        }

        $slug = $base;
        $counter = 1;

        while (
            static::where('slug', $slug)
                ->where('id', '!=', $this->id ?? 0)
                ->exists()
        ) {
            $slug = $base . '-' . $counter++;
        }

        return $slug;
    }

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | Route Binding
    |--------------------------------------------------------------------------
    */

    public function getRouteKeyName(): string
    {
        return 'slug';
    }


    /*
    |--------------------------------------------------------------------------
    | Elasticsearch Scout
    |--------------------------------------------------------------------------
    */
    public function searchableAs()
{
    return 'jobs';
}



    public function toSearchableArray()
{
    $this->loadMissing(['company','skills']);

    return [
        'id' => $this->id,
        'title' => $this->title,
        'slug' => $this->slug,
        'description' => $this->description,
        'location' => $this->location,
        'status' => $this->status,
        'categories' => $this->categories,
        'job_type' => $this->job_type,
        'experience_level' => $this->experience_level,
        'salary_min' => $this->salary_min,
        'salary_max' => $this->salary_max,
        'is_remote' => $this->is_remote,
        'published_at' => $this->published_at,

        'skills' => $this->skills->pluck('name')->toArray(),

        'company' => [
            'name' => $this->company->name,
            'slug' => $this->company->slug,
            'logo' => $this->company->logo,
        ]
    ];
}


}

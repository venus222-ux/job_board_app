<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Company extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'name', 'slug', 'description', 'website', 'logo'];

    public function owner() {
        return $this->belongsTo(User::class, 'user_id');
    }

    protected static function boot() {
        parent::boot();

        static::creating(fn($company) => $company->slug = static::generateUniqueSlug($company->name));
        static::updating(fn($company) => $company->slug = $company->isDirty('name') ? static::generateUniqueSlug($company->name, $company->id) : $company->slug);
    }

    protected static function generateUniqueSlug($name, $ignoreId = null) {
        $slug = Str::slug($name);
        $original = $slug;
        $i = 1;

        while(static::where('slug', $slug)->when($ignoreId, fn($q) => $q->where('id', '!=', $ignoreId))->exists()) {
            $slug = $original . '-' . $i++;
        }

        return $slug;
    }
}

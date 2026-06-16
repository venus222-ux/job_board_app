<?php

namespace App\Services\Company;

use App\Models\Company;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class CompanyService
{
    public function index()
    {
        return Company::select('id','name','slug','description','logo','website')
            ->latest()
            ->get();
    }

    public function store(array $data, $logo = null)
    {
        $logoPath = $logo ? $logo->store('logos', 'public') : null;

        return Company::create([
            'user_id' => Auth::id(),
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'website' => $data['website'] ?? null,
            'logo' => $logoPath,
        ]);
    }

        // ---------------- PUBLIC ----------------
    public function getAll()
    {
        return Company::select('id', 'name', 'slug', 'description', 'logo', 'website')
            ->latest()
            ->get();
    }

    public function getBySlug(string $slug)
    {
        return Company::where('slug', $slug)->firstOrFail();
    }

    // ---------------- EMPLOYER ----------------
    public function getEmployerCompanies(int $userId)
    {
        return Company::where('user_id', $userId)
            ->latest()
            ->get();
    }
}

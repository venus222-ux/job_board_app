<?php

namespace App\Services\Company;

use App\Models\Company;
use Illuminate\Support\Facades\Storage;

class CompanyService
{
    // ---------------- PUBLIC ----------------
    public function listCompanies()
    {
        return Company::select(
            'id',
            'name',
            'slug',
            'description',
            'logo',
            'website'
        )
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
        return Company::where('user_id', $userId)->get();
    }

    public function createCompany(array $data, int $userId, $logoFile = null)
    {
        $logoPath = $logoFile
            ? $logoFile->store('logos', 'public')
            : null;

        return Company::create([
            'user_id' => $userId,
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'website' => $data['website'] ?? null,
            'logo' => $logoPath,
        ]);
    }

    public function updateCompany(int $id, array $data, int $userId, $logoFile = null)
    {
        $company = Company::where('user_id', $userId)
            ->where('id', $id)
            ->firstOrFail();

        if ($logoFile) {
            if ($company->logo) {
                Storage::disk('public')->delete($company->logo);
            }

            $company->logo = $logoFile->store('logos', 'public');
        }

        $company->update([
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'website' => $data['website'] ?? null,
        ]);

        return $company->fresh();
    }

    public function deleteCompany(int $id, int $userId): void
    {
        $company = Company::where('user_id', $userId)
            ->where('id', $id)
            ->firstOrFail();

        if ($company->logo) {
            Storage::disk('public')->delete($company->logo);
        }

        $company->delete();
    }
}

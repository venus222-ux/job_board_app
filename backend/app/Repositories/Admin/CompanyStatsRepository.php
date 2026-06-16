<?php

namespace App\Repositories\Admin;

use App\Models\Company;

class CompanyStatsRepository
{
    public function totalCompanies(): int
    {
        return Company::count();
    }
}

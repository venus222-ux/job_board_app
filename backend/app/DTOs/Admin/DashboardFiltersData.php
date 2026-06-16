<?php

namespace App\DTOs\Admin;

use Carbon\Carbon;

readonly class DashboardFiltersData
{
    public function __construct(
        public string $range = '30d'
    ) {}

    public function startDate(): Carbon
    {
        return match ($this->range) {
            '7d' => now()->subDays(7),
            '30d' => now()->subDays(30),
            '90d' => now()->subDays(90),
            default => now()->subDays(30),
        };
    }
}

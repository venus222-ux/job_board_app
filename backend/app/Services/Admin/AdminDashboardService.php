<?php

namespace App\Services\Admin;

use App\DTOs\Admin\DashboardFiltersData;

class AdminDashboardService
{
    public function __construct(
        private AdminStatsService $statsService,
        private AdminAnalyticsService $analyticsService,
        private AdminMongoAnalyticsService $mongoAnalyticsService
    ) {}

    public function dashboard(
        DashboardFiltersData $filters
    ): array {
        return array_merge(
            $this->statsService->getStats(),
            $this->analyticsService->getAnalytics($filters),
            $this->mongoAnalyticsService->getAnalytics($filters)
        );
    }
}

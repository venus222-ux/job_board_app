<?php

namespace App\Services\Admin;

use App\DTOs\Admin\DashboardFiltersData;
use App\Repositories\Admin\JobViewRepository;
use App\Repositories\Admin\ActivityLogRepository;
use App\Repositories\Admin\ApplicationLogRepository;

class AdminMongoAnalyticsService
{
    public function __construct(
        private JobViewRepository $jobViewRepository,
        private ActivityLogRepository $activityLogRepository,
        private ApplicationLogRepository $applicationLogRepository
    ) {}

    public function getAnalytics(
        DashboardFiltersData $filters
    ): array {

        $startDate = $filters->startDate();

        return [
            'recentJobViews' =>
                $this->jobViewRepository
                    ->topViews($startDate),

            'recentActivityLogs' =>
                $this->activityLogRepository
                    ->recent($startDate),

            'recentApplicationLogs' =>
                $this->applicationLogRepository
                    ->recent($startDate),

            'activityStats' =>
                $this->activityLogRepository
                    ->stats($startDate),
        ];
    }
}

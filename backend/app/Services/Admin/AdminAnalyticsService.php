<?php

namespace App\Services\Admin;

use App\DTOs\Admin\DashboardFiltersData;
use App\Repositories\Admin\UserStatsRepository;
use App\Repositories\Admin\JobStatsRepository;
use App\Repositories\Admin\ApplicationStatsRepository;

class AdminAnalyticsService
{
    public function __construct(
        private UserStatsRepository $userRepository,
        private JobStatsRepository $jobRepository,
        private ApplicationStatsRepository $applicationRepository
    ) {}

    public function getAnalytics(
        DashboardFiltersData $filters
    ): array {

        $startDate = $filters->startDate();

        return [
            'jobStatusDistribution' =>
                $this->jobRepository->statusDistribution(),

            'userRoleDistribution' =>
                $this->userRepository->roleDistribution(),

            'monthlyApplications' =>
                $this->applicationRepository
                    ->monthlyApplications($startDate),

            'jobTypeDistribution' =>
                $this->jobRepository
                    ->typeDistribution(),
        ];
    }
}

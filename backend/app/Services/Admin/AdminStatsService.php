<?php

namespace App\Services\Admin;

use App\Repositories\Admin\UserStatsRepository;
use App\Repositories\Admin\CompanyStatsRepository;
use App\Repositories\Admin\JobStatsRepository;
use App\Repositories\Admin\ApplicationStatsRepository;

class AdminStatsService
{
    public function __construct(
        private UserStatsRepository $userRepository,
        private CompanyStatsRepository $companyRepository,
        private JobStatsRepository $jobRepository,
        private ApplicationStatsRepository $applicationRepository
    ) {}

    public function getStats(): array
    {
        return [
            'totalUsers' => $this->userRepository->totalUsers(),
            'totalCompanies' => $this->companyRepository->totalCompanies(),
            'totalJobs' => $this->jobRepository->totalJobs(),
            'activeJobs' => $this->jobRepository->activeJobs(),
            'totalApplications' => $this->applicationRepository->totalApplications(),
            'pendingApplications' => $this->applicationRepository->pendingApplications(),
            'recentUsers' => $this->userRepository->recentUsers(),
            'recentApplications' => $this->applicationRepository->recentApplications(),
        ];
    }
}

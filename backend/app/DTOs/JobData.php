<?php

namespace App\DTOs;

class JobData
{
    public function __construct(
        public string $title,
        public string $description,
        public string $location,
        public string $status = 'draft',
        public array $categories = [],
        public array $skills = [],
        public ?string $job_type = null,
        public ?float $salary_min = null,
        public ?float $salary_max = null,
        public ?string $salary_currency = null,
        public ?string $salary_type = null,
        public bool $is_remote = false,
        public string $experience_level = 'junior',
    ) {}
}

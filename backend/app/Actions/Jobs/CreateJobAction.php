<?php

namespace App\Actions\Jobs;

use App\DTOs\JobData;
use App\Models\Company;

class CreateJobAction
{
    public function execute(Company $company, JobData $data)
    {
        $job = $company->jobs()->create((array) $data);

        if ($data->skills) {
            $job->skills()->sync($data->skills);
        }

        return $job;
    }
}

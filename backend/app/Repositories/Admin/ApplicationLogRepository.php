<?php

namespace App\Repositories\Admin;

use App\Models\Mongo\ApplicationLog;
use Carbon\Carbon;

class ApplicationLogRepository
{
    public function recent(
        Carbon $startDate
    ) {
        return ApplicationLog::where(
            'created_at',
            '>=',
            $startDate
        )
            ->latest()
            ->limit(10)
            ->get();
    }
}

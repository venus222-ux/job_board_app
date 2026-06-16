<?php

namespace App\Repositories\Admin;

use App\Models\Mongo\ActivityLog;
use MongoDB\BSON\UTCDateTime;
use Carbon\Carbon;

class ActivityLogRepository
{
    public function recent(
        Carbon $startDate
    ) {
        return ActivityLog::where(
            'created_at',
            '>=',
            $startDate
        )
            ->latest()
            ->limit(10)
            ->get();
    }

    public function stats(
        Carbon $startDate
    ): array {

        $cursor = ActivityLog::raw(
            function ($collection) use ($startDate) {

                return $collection->aggregate([
                    [
                        '$match' => [
                            'created_at' => [
                                '$gte' => new UTCDateTime(
                                    $startDate->timestamp * 1000
                                )
                            ]
                        ]
                    ],
                    [
                        '$group' => [
                            '_id' => '$type',
                            'count' => ['$sum' => 1]
                        ]
                    ]
                ]);
            }
        );

        return iterator_to_array($cursor);
    }
}

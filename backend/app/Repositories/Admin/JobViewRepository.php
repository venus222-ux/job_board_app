<?php

namespace App\Repositories\Admin;

use App\Models\Mongo\JobView;
use MongoDB\BSON\UTCDateTime;
use Carbon\Carbon;

class JobViewRepository
{
    public function topViews(
        Carbon $startDate
    ): array {

        $cursor = JobView::raw(
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
                            '_id' => '$job_id',
                            'views' => [
                                '$sum' => [
                                    '$ifNull' => ['$views', 1]
                                ]
                            ]
                        ]
                    ],
                    ['$sort' => ['views' => -1]],
                    ['$limit' => 10]
                ]);
            }
        );

        $items = iterator_to_array($cursor);

        return array_map(
            fn ($item) => [
                '_id' => (string)($item['_id'] ?? ''),
                'views' => (int)($item['views'] ?? 0),
            ],
            $items
        );
    }
}

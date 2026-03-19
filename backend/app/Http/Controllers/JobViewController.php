<?php

// app/Http/Controllers/JobViewController.php
namespace App\Http\Controllers;

use App\Models\Mongo\JobView;
use Illuminate\Http\Request;
use MongoDB\BSON\UTCDateTime;

class JobViewController extends Controller
{
    public function increment($jobId, Request $request)
    {
        $userId = $request->user()->id ?? null; // Optional
        $ip = $request->ip();
        $source = $request->header('Referer') ?? 'direct';

        // Upsert: increment views for this job
        JobView::raw(function ($collection) use ($jobId, $userId, $ip, $source) {
            $collection->updateOne(
                ['job_id' => $jobId],
                [
                    '$inc' => ['views' => 1],
                    '$setOnInsert' => [
                        'created_at' => new UTCDateTime(now()->timestamp * 1000),
                        'updated_at' => new UTCDateTime(now()->timestamp * 1000),
                        'user_id' => $userId,
                        'ip' => $ip,
                        'source' => $source
                    ]
                ],
                ['upsert' => true]
            );
        });

        return response()->json(['message' => 'Job view recorded']);
    }
}

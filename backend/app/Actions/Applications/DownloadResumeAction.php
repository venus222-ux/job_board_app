<?php

namespace App\Actions\Applications;

use App\Jobs\SendResumeDownloadedEmail;
use App\Models\Application;
use Illuminate\Support\Facades\Storage;

class DownloadResumeAction
{
    public function execute(Application $application)
    {
        if (!Storage::disk('public')->exists($application->resume_path)) {
            abort(404, 'Resume not found');
        }

        SendResumeDownloadedEmail::dispatch($application);

        $fileName = 'resume.pdf';

        return response()->download(
            storage_path('app/public/' . $application->resume_path),
            $fileName,
            ['Content-Type' => 'application/pdf']
        );
    }
}

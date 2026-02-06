<?php

namespace App\Mail;

use App\Models\Application;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Contracts\Queue\ShouldQueue;

class ResumeDownloadedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public Application $application)
    {
    }

    public function build()
    {
        $companyName = $this->application->job->company->name ?? 'a company';
        $jobTitle = $this->application->job->title ?? 'a position';

        return $this
            ->subject("Your resume was downloaded by {$companyName} 📄")
            ->view('emails.resume_downloaded')
            ->with([
                'candidateName' => $this->application->candidate->name,
                'companyName' => $companyName,
                'jobTitle' => $jobTitle,
                'jobLocation' => $this->application->job->location,
                'downloadedAt' => now()->format('F j, Y, g:i a'),
            ]);
    }
}

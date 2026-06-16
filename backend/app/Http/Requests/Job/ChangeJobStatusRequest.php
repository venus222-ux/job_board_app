<?php

namespace App\Http\Requests\Job;

use Illuminate\Foundation\Http\FormRequest;

class ChangeJobStatusRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'status' => 'required|in:draft,published,closed',
        ];
    }
}

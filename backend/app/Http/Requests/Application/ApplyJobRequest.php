<?php

namespace App\Http\Requests\Application;

use Illuminate\Foundation\Http\FormRequest;

class ApplyJobRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'resume' => 'required|mimes:pdf|max:2048',
        ];
    }
}

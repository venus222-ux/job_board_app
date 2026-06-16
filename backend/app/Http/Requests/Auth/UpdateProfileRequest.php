<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use App\DTOs\Auth\UpdateProfileData;

class UpdateProfileRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'email' => 'required|email',
            'password' => 'nullable|min:6|confirmed',
        ];
    }

    public function dto(): UpdateProfileData
    {
        return new UpdateProfileData(
            email: $this->email,
            password: $this->password,
        );
    }
}

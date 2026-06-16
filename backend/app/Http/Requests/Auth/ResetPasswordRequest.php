<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use App\DTOs\Auth\ResetPasswordData;

class ResetPasswordRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'email' => 'required|email|exists:users,email',
            'token' => 'required',
            'password' => 'required|min:6|confirmed',
        ];
    }

    public function dto(): ResetPasswordData
    {
        return new ResetPasswordData(
            email: $this->email,
            token: $this->token,
            password: $this->password,
        );
    }
}

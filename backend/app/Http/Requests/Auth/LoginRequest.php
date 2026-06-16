<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use App\DTOs\Auth\LoginData;

class LoginRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'email' => 'required|email',
            'password' => 'required',
        ];
    }

    public function dto(): LoginData
    {
        return new LoginData(
            email: $this->email,
            password: $this->password,
        );
    }
}

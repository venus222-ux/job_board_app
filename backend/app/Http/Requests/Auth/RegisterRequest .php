<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use App\DTOs\Auth\RegisterData;

class RegisterRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6|confirmed',
            'role' => 'required|in:candidate,employer',
        ];
    }

    public function dto(): RegisterData
    {
        return new RegisterData(
            name: $this->name,
            email: $this->email,
            password: $this->password,
            role: $this->role,
        );
    }
}

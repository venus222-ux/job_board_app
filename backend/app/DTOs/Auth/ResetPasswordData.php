<?php

namespace App\DTOs\Auth;

readonly class ResetPasswordData
{
    public function __construct(
        public string $email,
        public string $token,
        public string $password,
    ) {}
}

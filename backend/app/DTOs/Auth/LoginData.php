<?php

namespace App\DTOs\Auth;

readonly class LoginData
{
    public function __construct(
        public string $email,
        public string $password,
    ) {}
}

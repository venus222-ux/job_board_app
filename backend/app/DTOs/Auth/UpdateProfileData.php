<?php

namespace App\DTOs\Auth;

readonly class UpdateProfileData
{
    public function __construct(
        public string $email,
        public ?string $password = null,
    ) {}
}

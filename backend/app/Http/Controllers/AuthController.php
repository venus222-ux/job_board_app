<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\UpdateProfileRequest;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Services\Auth\AuthService;
use App\Services\Auth\ProfileService;
use App\Services\Auth\PasswordResetService;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function __construct(
        private AuthService $authService,
        private ProfileService $profileService,
        private PasswordResetService $passwordResetService
    ) {}

    public function register(RegisterRequest $request)
    {
        return response()->json(
            $this->authService->register(
                $request->dto()
            )
        );
    }

    public function login(LoginRequest $request)
    {
        return response()->json(
            $this->authService->login(
                $request->dto(),
                $request
            )
        );
    }

    public function logout()
    {
        return response()->json(
            $this->authService->logout()
        );
    }

    public function refresh()
    {
        return response()->json(
            $this->authService->refresh()
        );
    }

    public function me()
    {
        return response()->json(
            $this->authService->me()
        );
    }

    public function profile()
    {
        return response()->json(
            $this->profileService->profile()
        );
    }

    public function updateProfile(
        UpdateProfileRequest $request
    ) {
        return response()->json(
            $this->profileService->update(
                $request->dto()
            )
        );
    }

    public function destroyProfile()
    {
        return response()->json(
            $this->profileService->destroy()
        );
    }

    public function forgotPassword(
        ForgotPasswordRequest $request
    ) {
        return response()->json(
            $this->passwordResetService
                ->forgotPassword(
                    $request->email
                )
        );
    }

    public function resetPassword(
        ResetPasswordRequest $request
    ) {
        return response()->json(
            $this->passwordResetService
                ->resetPassword(
                    $request->dto()
                )
        );
    }
}
